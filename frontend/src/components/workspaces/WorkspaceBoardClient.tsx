"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { ApiClientError } from "../../lib/apiShared";
import {
  buildWorkspaceDetailHref,
  type WorkspaceDetailView,
  workspaceDetailViewItems,
} from "../../lib/workspaceNavigation";
import { getSocketClient } from "../../lib/socketClient";
import { TaskDetailPanel } from "../tasks/TaskDetailPanel";
import type {
  ActivityEntry,
  ActivityCreatedEventPayload,
  Comment,
  CommentCreatedEventPayload,
  Task,
  TaskDeletedEventPayload,
  TaskEventPayload,
  TaskStatus,
  Workspace,
  WorkspaceMember,
  WorkspaceMemberJoinedEventPayload,
} from "../../types/app";

type WorkspaceBoardClientProps = {
  workspace: Workspace;
  members: WorkspaceMember[];
  initialTasks: Task[];
  activityEntries: ActivityEntry[];
  activeView: WorkspaceDetailView;
  currentUserId: string;
};

type SaveTaskInput = {
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
};

type SocketState = "connecting" | "connected" | "disconnected" | "forbidden";
type StatusFilter = "ALL" | TaskStatus;

const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const formatDate = (value?: string | null) => {
  if (!value) {
    return "No due date";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "No due date";
  }
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "Unavailable";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Unavailable";
  }
};

const normalizeTaskList = (tasks: Task[]) => {
  return [...tasks].sort((left, right) => {
    const leftTime = new Date(left.updatedAt).getTime();
    const rightTime = new Date(right.updatedAt).getTime();
    return rightTime - leftTime;
  });
};

const upsertTask = (tasks: Task[], incomingTask: Task) => {
  const existingIndex = tasks.findIndex((entry) => entry.id === incomingTask.id);

  if (existingIndex === -1) {
    return normalizeTaskList([incomingTask, ...tasks]);
  }

  const nextTasks = [...tasks];
  nextTasks[existingIndex] = incomingTask;
  return normalizeTaskList(nextTasks);
};

const removeTask = (tasks: Task[], taskId: string) =>
  tasks.filter((entry) => entry.id !== taskId);

const prependActivity = (entries: ActivityEntry[], incomingEntry: ActivityEntry) => {
  const nextEntries = [incomingEntry, ...entries.filter((entry) => entry.id !== incomingEntry.id)];
  return nextEntries.slice(0, 12);
};

const toUserError = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
};

const statusLabel = (status: TaskStatus) => {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  if (status === "TODO") {
    return "Todo";
  }

  return "Done";
};

const getStatusTone = (status: TaskStatus) => {
  if (status === "DONE") {
    return "bg-emerald-500";
  }

  if (status === "IN_PROGRESS") {
    return "bg-sky-500";
  }

  return "bg-slate-400";
};

const getActivityLabel = (entry: ActivityEntry) => {
  switch (entry.action) {
    case "WORKSPACE_CREATED":
      return "created the workspace";
    case "WORKSPACE_MEMBER_ADDED":
      return "joined the workspace";
    case "TASK_CREATED":
      return "created a task";
    case "TASK_UPDATED":
      return "updated a task";
    case "TASK_STATUS_CHANGED":
      return "changed task status";
    case "TASK_DELETED":
      return "removed a task";
    case "COMMENT_ADDED":
      return "added a comment";
    default:
      return entry.action.toLowerCase().replaceAll("_", " ");
  }
};

function ActivityFeed({
  entries,
  emptyTitle,
  emptyDescription,
}: {
  entries: ActivityEntry[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 px-5 py-8 text-center">
        <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                <span>{entry.actor.name}</span>{" "}
                <span className="font-medium text-muted-foreground">
                  {getActivityLabel(entry)}
                </span>
              </p>
              {entry.task ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Task: <span className="font-medium text-foreground">{entry.task.title}</span>
                </p>
              ) : null}
            </div>
            <time className="shrink-0 text-xs font-medium text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </time>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function WorkspaceBoardClient({
  workspace,
  members,
  initialTasks,
  activityEntries,
  activeView,
  currentUserId,
}: WorkspaceBoardClientProps) {
  const [workspaceState, setWorkspaceState] = useState(workspace);
  const [memberList, setMemberList] = useState(members);
  const [tasks, setTasks] = useState(() => normalizeTaskList(initialTasks));
  const [activityFeed, setActivityFeed] = useState(activityEntries);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [socketState, setSocketState] = useState<SocketState>("connecting");
  const [latestCommentEvent, setLatestCommentEvent] =
    useState<CommentCreatedEventPayload | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");
  const [createAssigneeId, setCreateAssigneeId] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createTaskError, setCreateTaskError] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [copiedField, setCopiedField] = useState<"code" | "link" | null>(null);

  const handledCommentIdsRef = useRef(new Set<string>());

  useEffect(() => {
    setWorkspaceState(workspace);
    setMemberList(members);
    setTasks(normalizeTaskList(initialTasks));
    setActivityFeed(activityEntries);
    setLatestCommentEvent(null);
    setSearchQuery("");
    setStatusFilter("ALL");
    setSelectedTaskId(null);
    setIsCreateModalOpen(false);
    setCreateTaskError("");
    handledCommentIdsRef.current.clear();
  }, [activityEntries, initialTasks, members, workspace]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );
  const selectedTaskPermissions = useMemo(() => {
    if (!selectedTask) {
      return null;
    }

    const isWorkspaceAdmin = workspaceState.currentUserRole === "ADMIN";
    const isTaskCreator = selectedTask.creator.id === currentUserId;
    const isTaskAssignee = selectedTask.assigneeId === currentUserId;

    return {
      canEditDetails: isWorkspaceAdmin || isTaskCreator,
      canChangeStatus: isWorkspaceAdmin || isTaskCreator || isTaskAssignee,
      canDelete: isWorkspaceAdmin || isTaskCreator,
      canComment: true,
    };
  }, [currentUserId, selectedTask, workspaceState.currentUserRole]);

  const allTasksByStatus = useMemo(
    () => ({
      TODO: tasks.filter((task) => task.status === "TODO"),
      IN_PROGRESS: tasks.filter((task) => task.status === "IN_PROGRESS"),
      DONE: tasks.filter((task) => task.status === "DONE"),
    }),
    [tasks],
  );

  const recentTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        task.title.toLowerCase().includes(normalizedQuery) ||
        (task.description ?? "").toLowerCase().includes(normalizedQuery) ||
        (task.assignee?.name ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [searchQuery, statusFilter, tasks]);

  // Clear selection if the selected task gets deleted
  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    const socket = getSocketClient();

    const joinWorkspaceRoom = () => {
      setSocketState("connecting");
      socket.emit("workspaceJoin", workspace.id, (response?: { ok: boolean; message?: string }) => {
        if (!response?.ok) {
          setSocketState("forbidden");
          return;
        }

        setSocketState("connected");
      });
    };

    const handleConnect = () => {
      joinWorkspaceRoom();
    };

    const handleDisconnect = () => {
      setSocketState("disconnected");
    };

    const handleConnectError = () => {
      setSocketState("disconnected");
    };

    const handleTaskCreated = (payload: TaskEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setTasks((currentTasks) => upsertTask(currentTasks, payload.task));
      setSelectedTaskId((currentSelectedTaskId) => currentSelectedTaskId ?? payload.task.id);
    };

    const handleTaskUpdated = (payload: TaskEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setTasks((currentTasks) => upsertTask(currentTasks, payload.task));
    };

    const handleTaskDeleted = (payload: TaskDeletedEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setTasks((currentTasks) => removeTask(currentTasks, payload.taskId));
      setSelectedTaskId((currentSelectedTaskId) =>
        currentSelectedTaskId === payload.taskId ? null : currentSelectedTaskId,
      );
    };

    const handleCommentCreated = (payload: CommentCreatedEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setLatestCommentEvent(payload);

      if (handledCommentIdsRef.current.has(payload.comment.id)) {
        return;
      }

      handledCommentIdsRef.current.add(payload.comment.id);
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === payload.taskId
            ? {
              ...task,
              commentCount: task.commentCount + 1,
            }
            : task,
        ),
      );
    };

    const handleActivityCreated = (payload: ActivityCreatedEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setActivityFeed((currentEntries) => prependActivity(currentEntries, payload.activity));
    };

    const handleWorkspaceMemberJoined = (payload: WorkspaceMemberJoinedEventPayload) => {
      if (payload.workspaceId !== workspace.id) {
        return;
      }

      setMemberList((currentMembers) => {
        if (currentMembers.some((entry) => entry.id === payload.member.id)) {
          return currentMembers;
        }

        return [...currentMembers, payload.member].sort((left, right) =>
          left.user.name.localeCompare(right.user.name),
        );
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("taskCreated", handleTaskCreated);
    socket.on("taskUpdated", handleTaskUpdated);
    socket.on("taskStatusChanged", handleTaskUpdated);
    socket.on("taskDeleted", handleTaskDeleted);
    socket.on("commentCreated", handleCommentCreated);
    socket.on("activityCreated", handleActivityCreated);
    socket.on("workspaceMemberJoined", handleWorkspaceMemberJoined);

    if (!socket.connected) {
      socket.connect();
    } else {
      joinWorkspaceRoom();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("taskCreated", handleTaskCreated);
      socket.off("taskUpdated", handleTaskUpdated);
      socket.off("taskStatusChanged", handleTaskUpdated);
      socket.off("taskDeleted", handleTaskDeleted);
      socket.off("commentCreated", handleCommentCreated);
      socket.off("activityCreated", handleActivityCreated);
      socket.off("workspaceMemberJoined", handleWorkspaceMemberJoined);
      socket.emit("workspaceLeave", workspace.id);
    };
  }, [workspace.id]);

  useEffect(() => {
    if (!copiedField) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopiedField(null);
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copiedField]);

  const handleCopy = async (value: string, field: "code" | "link") => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
    } catch {
      setCopiedField(null);
    }
  };

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreatingTask) {
      return;
    }

    setCreateTaskError("");
    setIsCreatingTask(true);

    try {
      const createdTask = await apiClient<Task>(`/api/workspaces/${workspaceState.id}/tasks`, {
        method: "POST",
        body: {
          title: createTitle,
          description: createDescription.trim() ? createDescription : null,
          status: createStatus,
          assigneeId: createAssigneeId || null,
          dueDate: createDueDate || null,
        },
      });

      setTasks((currentTasks) => upsertTask(currentTasks, createdTask));
      setSelectedTaskId(createdTask.id);
      setIsCreateModalOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      setCreateStatus("TODO");
      setCreateAssigneeId("");
      setCreateDueDate("");
    } catch (error) {
      setCreateTaskError(toUserError(error, "Unable to create task."));
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleSaveTask = async (taskId: string, input: SaveTaskInput) => {
    const updatedTask = await apiClient<Task>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: input,
    });

    setTasks((currentTasks) => upsertTask(currentTasks, updatedTask));
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const updatedTask = await apiClient<Task>(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      body: {
        status,
      },
    });

    setTasks((currentTasks) => upsertTask(currentTasks, updatedTask));
  };

  const handleDeleteTask = async (taskId: string) => {
    await apiClient<void>(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

    setTasks((currentTasks) => removeTask(currentTasks, taskId));
    setSelectedTaskId((currentSelectedTaskId) =>
      currentSelectedTaskId === taskId ? null : currentSelectedTaskId,
    );
  };

  const handleLocalCommentCreated = (comment: Comment) => {
    handledCommentIdsRef.current.add(comment.id);
    setLatestCommentEvent({
      workspaceId: comment.workspaceId,
      taskId: comment.taskId,
      comment,
    });
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === comment.taskId
          ? {
            ...task,
            commentCount: task.commentCount + 1,
          }
          : task,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <div className="bg-gradient-to-r from-background via-background to-primary/5 p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                  {workspaceState.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-bold tracking-tight text-foreground">
                    {workspaceState.name}
                  </h1>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {workspaceState.description || "A shared workspace for real-time collaboration."}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                  {memberList.length} members
                </span>
                <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                  {tasks.length} tasks
                </span>
                <span className="rounded-full bg-secondary px-3 py-1.5 text-secondary-foreground">
                  Created {formatDate(workspaceState.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 sm:items-end">
              <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${socketState === "connected"
                      ? "bg-emerald-500"
                      : socketState === "forbidden"
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }`}
                />
                <span>
                  {socketState === "connected"
                    ? "Live updates connected"
                    : socketState === "forbidden"
                      ? "Live updates unavailable"
                      : "Connecting"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                disabled={!workspaceState.permissions.canCreateTasks}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                Create task
              </button>
            </div>
          </div>
        </div>
      </header>

      {activeView === "overview" ? (
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <section>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Activity logs</h2>
                <p className="mt-1 text-sm text-muted-foreground">Latest changes across the workspace.</p>
              </div>
              <Link
                href={buildWorkspaceDetailHref(workspaceState.id, "activity")}
                className="text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            <ActivityFeed
              entries={activityFeed.slice(0, 10)}
              emptyTitle="No activity yet"
              emptyDescription="Activity appears here as soon as teammates start collaborating."
            />
          </section>

          <section>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Recent tasks</h2>
                <p className="mt-1 text-sm text-muted-foreground">Work that needs attention.</p>
              </div>
              <Link
                href={buildWorkspaceDetailHref(workspaceState.id, "tasks")}
                className="text-sm font-semibold text-primary transition hover:text-primary/80"
              >
                View all
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/70 py-10 text-center">
                <p className="text-sm font-semibold text-foreground">No tasks yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create the first task to start organizing.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {recentTasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={buildWorkspaceDetailHref(workspaceState.id, "tasks")}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex items-center gap-2.5">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${getStatusTone(task.status)}`} />
                          <p className="truncate text-sm font-semibold text-foreground">
                            {task.title}
                          </p>
                        </div>
                        <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {statusLabel(task.status)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{task.assignee?.name ?? "Unassigned"}</span>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {activeView === "tasks" ? (
        <div className="flex flex-col gap-6 max-w-5xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Tasks board</h2>
                <p className="mt-1 text-sm text-muted-foreground">Search and filter active work.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full sm:flex-1 rounded-xl border border-border/70 bg-card px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  placeholder="Search tasks..."
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${statusFilter === "ALL" ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                >All ({tasks.length})</button>
                {taskStatuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${statusFilter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                  >
                    {statusLabel(status)} ({allTasksByStatus[status].length})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {visibleTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 py-12 text-center">
                  <p className="text-sm font-semibold text-foreground">No tasks found</p>
                </div>
              ) : (
                visibleTasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${selectedTaskId === task.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                        : "border-border/60 bg-card hover:border-primary/40 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${getStatusTone(task.status)}`} />
                          <h3 className="truncate text-sm font-semibold text-foreground">{task.title}</h3>
                        </div>
                      </div>
                      {task.description ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                      ) : null}
                      <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{task.assignee?.name ?? "Unassigned"}</span>
                          <span>{task.commentCount} comments</span>
                        </div>
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeView === "members" ? (
        <div className="flex flex-col gap-6">
          <div className="mb-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Team members</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Everyone with access to this workspace right now.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Your role</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You are currently an{" "}
                <span className="font-semibold text-foreground">
                  {workspaceState.currentUserRole}
                </span>{" "}
                in this workspace.
              </p>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Permission summary</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Admins can manage any task and share invites. Members can create
                tasks, comment, and only change tasks they created or were assigned.
              </p>
            </section>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memberList.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 transition hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {member.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                    {member.role}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">
                    {member.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {activeView === "activity" ? (
        <div className="flex flex-col gap-6 max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Activity log</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A running record of workspace changes, task movement, and comments.
            </p>
          </div>
          <ActivityFeed
            entries={activityFeed}
            emptyTitle="No activity yet"
            emptyDescription="This timeline will fill in as work starts moving."
          />
        </div>
      ) : null}

      {selectedTask ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm sm:p-6">
          <button
            type="button"
            aria-label="Close task details"
            onClick={() => setSelectedTaskId(null)}
            className="absolute inset-0"
          />
          <div className="relative z-10 flex w-full max-w-5xl flex-col rounded-[2rem] border border-border/60 bg-card shadow-2xl" style={{ maxHeight: "calc(100vh - 3rem)" }}>
            {/* Modal header */}
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/40 px-6 py-4 md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Task</p>
                <h2 className="mt-0.5 truncate text-base font-bold text-foreground">{selectedTask.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="shrink-0 rounded-full border border-border/50 bg-background/80 p-2 text-muted-foreground backdrop-blur shadow-sm transition hover:bg-background hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Modal body — scrollable */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
              <TaskDetailPanel
                task={selectedTask}
                members={memberList}
                permissions={selectedTaskPermissions}
                latestCommentEvent={latestCommentEvent}
                onSaveTask={handleSaveTask}
                onStatusChange={handleStatusChange}
                onDeleteTask={handleDeleteTask}
                onLocalCommentCreated={handleLocalCommentCreated}
              />
            </div>
          </div>
        </div>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close create task dialog"
            onClick={() => setIsCreateModalOpen(false)}
            className="absolute inset-0"
          />
          <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-xl lg:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Create task
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a clear title, optional assignee, and due date.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full border border-border/70 p-2 text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleCreateTask}>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Title
                </span>
                <input
                  required
                  maxLength={120}
                  autoFocus
                  value={createTitle}
                  onChange={(event) => setCreateTitle(event.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Ship onboarding checklist"
                />
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Description
                </span>
                <textarea
                  rows={4}
                  maxLength={2000}
                  value={createDescription}
                  onChange={(event) => setCreateDescription(event.target.value)}
                  className="w-full resize-none rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Capture the key steps and acceptance criteria."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </span>
                <select
                  value={createStatus}
                  onChange={(event) => setCreateStatus(event.target.value as TaskStatus)}
                  className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  {taskStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Assignee
                </span>
                <select
                  value={createAssigneeId}
                  onChange={(event) => setCreateAssigneeId(event.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option value="">Unassigned</option>
                  {memberList.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Due date
                </span>
                <input
                  type="date"
                  value={createDueDate}
                  onChange={(event) => setCreateDueDate(event.target.value)}
                  className="w-full rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </label>

              {createTaskError ? (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                  {createTaskError}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-3 border-t border-border/50 pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask || !createTitle.trim()}
                  className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingTask ? "Creating..." : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
