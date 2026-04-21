"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { ApiClientError } from "../../lib/apiShared";
import type {
  Comment,
  CommentCreatedEventPayload,
  Task,
  TaskStatus,
  WorkspaceMember,
} from "../../types/app";

type SaveTaskInput = {
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
};

type TaskPermissions = {
  canEditDetails: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  canComment: boolean;
};

type TaskDetailPanelProps = {
  task: Task | null;
  members: WorkspaceMember[];
  permissions: TaskPermissions | null;
  latestCommentEvent: CommentCreatedEventPayload | null;
  onSaveTask: (taskId: string, input: SaveTaskInput) => Promise<void>;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onLocalCommentCreated: (comment: Comment) => void;
};

const taskStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const statusLabel = (status: TaskStatus) => {
  if (status === "IN_PROGRESS") return "In Progress";
  if (status === "TODO") return "To Do";
  return "Done";
};

const statusColor = (status: TaskStatus) => {
  if (status === "DONE") return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (status === "IN_PROGRESS") return "text-sky-600 bg-sky-50 border-sky-200";
  return "text-slate-600 bg-slate-50 border-slate-200";
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toUserError = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) return error.message;
  return fallback;
};

const formatDateTime = (value: string) => {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export function TaskDetailPanel({
  task,
  members,
  permissions,
  latestCommentEvent,
  onSaveTask,
  onStatusChange,
  onDeleteTask,
  onLocalCommentCreated,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");

  const [isSavingTask, setIsSavingTask] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [taskError, setTaskError] = useState("");

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const commentsCountText = useMemo(() => {
    if (comments.length === 1) return "1 comment";
    return `${comments.length} comments`;
  }, [comments.length]);

  const activeTaskId = task?.id ?? null;
  const canEditDetails = permissions?.canEditDetails ?? false;
  const canChangeStatus = permissions?.canChangeStatus ?? false;
  const canDelete = permissions?.canDelete ?? false;
  const canComment = permissions?.canComment ?? false;

  useEffect(() => {
    if (!task) {
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setStatus("TODO");
      setComments([]);
      setCommentError("");
      setNewCommentContent("");
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? "");
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(toDateInputValue(task.dueDate));
    setStatus(task.status);
    setTaskError("");
    setCommentError("");
    setNewCommentContent("");
  }, [task]);

  useEffect(() => {
    if (!activeTaskId) {
      setComments([]);
      setIsLoadingComments(false);
      return;
    }

    let isActive = true;
    setComments([]);

    const loadComments = async () => {
      setIsLoadingComments(true);
      setCommentError("");

      try {
        const response = await apiClient<Comment[]>(
          `/api/tasks/${activeTaskId}/comments`,
        );

        if (!isActive) return;
        setComments(response);
      } catch (error) {
        if (!isActive) return;
        setCommentError(toUserError(error, "Unable to load comments."));
        setComments([]);
      } finally {
        if (isActive) setIsLoadingComments(false);
      }
    };

    void loadComments();

    return () => {
      isActive = false;
    };
  }, [activeTaskId]);

  useEffect(() => {
    if (!task || !latestCommentEvent || latestCommentEvent.taskId !== task.id) {
      return;
    }

    const incomingComment = latestCommentEvent.comment;

    setComments((existingComments) => {
      if (existingComments.some((entry) => entry.id === incomingComment.id)) {
        return existingComments;
      }
      return [...existingComments, incomingComment];
    });
  }, [latestCommentEvent, task]);

  // Auto-scroll to newest comment
  useEffect(() => {
    if (comments.length > 0 && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length]);

  if (!task) {
    return (
      <section className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground mb-5 border border-border/50">
          <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">Select a task</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-[200px] leading-relaxed">
          Choose a task from the list to view and edit its details.
        </p>
      </section>
    );
  }

  const handleSaveTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingTask) return;

    setTaskError("");
    setIsSavingTask(true);

    try {
      await onSaveTask(task.id, {
        title,
        description: description.trim() ? description : null,
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
      });
    } catch (error) {
      setTaskError(toUserError(error, "Unable to save task changes."));
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleStatusChange = async (nextStatus: TaskStatus) => {
    setStatus(nextStatus);
    setTaskError("");
    setIsUpdatingStatus(true);

    try {
      await onStatusChange(task.id, nextStatus);
    } catch (error) {
      setTaskError(toUserError(error, "Unable to update task status."));
      setStatus(task.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTask = async () => {
    if (isDeletingTask) return;

    const confirmed = window.confirm("Delete this task? This action cannot be undone.");
    if (!confirmed) return;

    setTaskError("");
    setIsDeletingTask(true);

    try {
      await onDeleteTask(task.id);
    } catch (error) {
      setTaskError(toUserError(error, "Unable to delete task."));
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingComment) return;

    const normalizedCommentContent = newCommentContent.trim();
    if (!normalizedCommentContent) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setCommentError("");
    setIsSubmittingComment(true);

    try {
      const comment = await apiClient<Comment>(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        body: { content: normalizedCommentContent },
      });

      setComments((existingComments) => {
        if (existingComments.some((entry) => entry.id === comment.id)) {
          return existingComments;
        }
        return [...existingComments, comment];
      });

      onLocalCommentCreated(comment);
      setNewCommentContent("");
    } catch (error) {
      setCommentError(toUserError(error, "Unable to add comment."));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_360px] gap-0 min-h-[520px]">
      {/* ── Left column: Task details ── */}
      <div className="flex flex-col gap-5 pr-0 md:pr-7 overflow-y-auto">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Task details</h2>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Created by{" "}
              <span className="text-foreground">{task.creator.name}</span>{" "}
              · {formatDateTime(task.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteTask}
            disabled={isDeletingTask || !canDelete}
            className="shrink-0 rounded-xl border border-red-200/60 bg-red-50/60 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeletingTask ? "Deleting…" : "Delete"}
          </button>
        </div>

        {/* Read-only notice */}
        {!canEditDetails && !canChangeStatus && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            This task is read-only for you. Only workspace admins, the task creator, or
            the assignee can change it.
          </p>
        )}

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          {taskStatuses.map((s) => (
            <button
              key={s}
              type="button"
              disabled={isUpdatingStatus || !canChangeStatus}
              onClick={() => void handleStatusChange(s)}
              className={`rounded-full border px-3.5 py-1 text-xs font-bold transition ${
                status === s
                  ? statusColor(s)
                  : "border-border/50 bg-background text-muted-foreground hover:bg-secondary"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {statusLabel(s)}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSaveTask}>
          {/* Title */}
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Title
            </span>
            <input
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canEditDetails}
              className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground outline-none transition placeholder:text-muted-foreground/40 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              placeholder="Task title"
            />
          </label>

          {/* Description */}
          <label className="block space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Description
            </span>
            <textarea
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEditDetails}
              className="w-full resize-none rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground/40 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              placeholder="Add context, steps, or acceptance criteria…"
            />
          </label>

          {/* Assignee + Due date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Assignee
              </span>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={!canEditDetails}
                className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Due date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={!canEditDetails}
                className="w-full rounded-xl border border-border/70 bg-background/60 px-4 py-2.5 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              />
            </label>
          </div>

          {taskError && (
            <p className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
              {taskError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSavingTask || !canEditDetails}
            className="w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-bold text-background shadow-sm transition hover:bg-foreground/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingTask ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>

      {/* ── Vertical divider ── */}
      <div className="hidden md:block bg-border/50 mx-0" />

      {/* ── Right column: Comments ── */}
      <div className="flex flex-col border-t border-border/50 pt-6 mt-6 md:border-t-0 md:pt-0 md:mt-0 md:pl-7">
        {/* Comments header */}
        <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
          <h3 className="text-base font-bold tracking-tight text-foreground">Comments</h3>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary-foreground">
            {commentsCountText}
          </span>
        </div>

        {/* Comment list — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 max-h-[320px] md:max-h-none pr-1 space-y-0.5">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-10">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : commentError ? (
            <p className="rounded-xl border border-red-200/60 bg-red-50 px-4 py-3 text-xs font-medium text-red-800">
              {commentError}
            </p>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-3">
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-foreground">No comments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Be the first to start the conversation.</p>
            </div>
          ) : (
            <ul className="space-y-3 pb-2">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="group rounded-2xl border border-border/50 bg-background/60 p-3.5 transition hover:border-border/80 hover:bg-background"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {getInitials(comment.author.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-foreground">{comment.author.name}</p>
                        <time className="shrink-0 text-[10px] font-medium text-muted-foreground/70">
                          {formatDateTime(comment.createdAt)}
                        </time>
                      </div>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              <div ref={commentsEndRef} />
            </ul>
          )}
        </div>

        {/* Comment composer — pinned at bottom */}
        <div className="mt-4 shrink-0 border-t border-border/40 pt-4">
          <form onSubmit={handleCreateComment} className="flex flex-col gap-2">
            <textarea
              required
              maxLength={1000}
              rows={3}
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              disabled={!canComment}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              className="w-full resize-none rounded-xl border border-border/70 bg-background/60 px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/40 focus:border-primary focus:bg-background focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
              placeholder={canComment ? "Write a comment… (⌘↵ to send)" : "You cannot comment on this task."}
            />
            {commentError && (
              <p className="text-xs font-medium text-red-600">{commentError}</p>
            )}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentContent.trim() || !canComment}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmittingComment ? "Posting…" : "Post comment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
