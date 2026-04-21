import { ActivityAction, Prisma, TaskStatus } from "@prisma/client";
import prisma from "../config/prisma.js";
import { emitWorkspaceEvent } from "../realtime/socketServer.js";
import { socketEvents } from "../realtime/socketEvents.js";
import { recordActivity } from "./activityService.js";
import {
  ensureTaskDeletable,
  ensureTaskDetailsEditable,
  ensureTaskStatusEditable,
  ensureWorkspaceAssignee,
  ensureWorkspaceMember,
} from "./workspaceAccessService.js";

type ListTasksInput = {
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  search?: string;
  assigneeId?: string;
};

type CreateTaskInput = {
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  assigneeId?: string | null;
  dueDate?: Date | null;
};

type UpdateTaskInput = {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: Date | null;
};

const taskSelect = {
  id: true,
  workspaceId: true,
  title: true,
  description: true,
  status: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  _count: {
    select: {
      comments: {
        where: {
          deletedAt: null,
        },
      },
    },
  },
} satisfies Prisma.TaskSelect;

const serializeTask = (
  task: Prisma.TaskGetPayload<{ select: typeof taskSelect }>,
) => ({
  id: task.id,
  workspaceId: task.workspaceId,
  title: task.title,
  description: task.description,
  status: task.status,
  dueDate: task.dueDate,
  completedAt: task.completedAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  creator: task.creator,
  assignee: task.assignee,
  assigneeId: task.assignee?.id ?? null,
  commentCount: task._count.comments,
});

const loadTask = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: taskSelect,
  });

  if (!task || task.status === "CANCELLED") {
    return null;
  }

  return task;
};

const normalizeStatus = (status?: "TODO" | "IN_PROGRESS" | "DONE") => {
  return (status ?? "TODO") as TaskStatus;
};

export const listTasks = async (
  workspaceId: string,
  userId: string,
  filters: ListTasksInput,
) => {
  await ensureWorkspaceMember(workspaceId, userId);

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId,
      deletedAt: null,
      status: filters.status as TaskStatus | undefined,
      assigneeId: filters.assigneeId,
      ...(filters.search
        ? {
            OR: [
              {
                title: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: taskSelect,
  });

  return tasks.map(serializeTask);
};

export const createTask = async (
  workspaceId: string,
  userId: string,
  input: CreateTaskInput,
) => {
  await ensureWorkspaceMember(workspaceId, userId);

  if (input.assigneeId) {
    await ensureWorkspaceAssignee(workspaceId, input.assigneeId);
  }

  const { task, activity } = await prisma.$transaction(async (transaction) => {
    const createdTask = await transaction.task.create({
      data: {
        workspaceId,
        title: input.title,
        description: input.description,
        status: normalizeStatus(input.status),
        creatorId: userId,
        assigneeId: input.assigneeId ?? undefined,
        dueDate: input.dueDate ?? undefined,
        completedAt:
          normalizeStatus(input.status) === "DONE" ? new Date() : null,
      },
      select: taskSelect,
    });

    const activity = await recordActivity(transaction, {
      action: ActivityAction.TASK_CREATED,
      workspaceId,
      actorId: userId,
      taskId: createdTask.id,
      metadata: {
        status: createdTask.status,
        assigneeId: createdTask.assignee?.id ?? null,
      },
    });

    return {
      task: createdTask,
      activity,
    };
  });

  const serializedTask = serializeTask(task);
  emitWorkspaceEvent(workspaceId, socketEvents.taskCreated, {
    workspaceId,
    task: serializedTask,
  });
  emitWorkspaceEvent(workspaceId, socketEvents.activityCreated, {
    workspaceId,
    activity,
  });

  return serializedTask;
};

export const updateTask = async (
  taskId: string,
  userId: string,
  input: UpdateTaskInput,
) => {
  const taskAccess = await ensureTaskDetailsEditable(taskId, userId);

  if (input.assigneeId) {
    await ensureWorkspaceAssignee(taskAccess.task.workspaceId, input.assigneeId);
  }

  const { task, activity } = await prisma.$transaction(async (transaction) => {
    const updatedTask = await transaction.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: input.title,
        description:
          input.description === undefined ? undefined : input.description,
        assigneeId: input.assigneeId === undefined ? undefined : input.assigneeId,
        dueDate: input.dueDate === undefined ? undefined : input.dueDate,
      },
      select: taskSelect,
    });

    const activity = await recordActivity(transaction, {
      action: ActivityAction.TASK_UPDATED,
      workspaceId: taskAccess.task.workspaceId,
      actorId: userId,
      taskId,
      metadata: {
        title: updatedTask.title,
        assigneeId: updatedTask.assignee?.id ?? null,
        dueDate: updatedTask.dueDate?.toISOString() ?? null,
      },
    });

    return {
      task: updatedTask,
      activity,
    };
  });

  const serializedTask = serializeTask(task);
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.taskUpdated, {
    workspaceId: taskAccess.task.workspaceId,
    task: serializedTask,
  });
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.activityCreated, {
    workspaceId: taskAccess.task.workspaceId,
    activity,
  });

  return serializedTask;
};

export const updateTaskStatus = async (
  taskId: string,
  userId: string,
  status: "TODO" | "IN_PROGRESS" | "DONE",
) => {
  const taskAccess = await ensureTaskStatusEditable(taskId, userId);

  const normalizedStatus = normalizeStatus(status);
  const { task, activity } = await prisma.$transaction(async (transaction) => {
    const updatedTask = await transaction.task.update({
      where: {
        id: taskId,
      },
      data: {
        status: normalizedStatus,
        completedAt: normalizedStatus === "DONE" ? new Date() : null,
      },
      select: taskSelect,
    });

    const activity = await recordActivity(transaction, {
      action: ActivityAction.TASK_STATUS_CHANGED,
      workspaceId: taskAccess.task.workspaceId,
      actorId: userId,
      taskId,
      metadata: {
        status: normalizedStatus,
      },
    });

    return {
      task: updatedTask,
      activity,
    };
  });

  const serializedTask = serializeTask(task);
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.taskStatusChanged, {
    workspaceId: taskAccess.task.workspaceId,
    task: serializedTask,
  });
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.activityCreated, {
    workspaceId: taskAccess.task.workspaceId,
    activity,
  });

  return serializedTask;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const taskAccess = await ensureTaskDeletable(taskId, userId);

  const activity = await prisma.$transaction(async (transaction) => {
    await transaction.task.update({
      where: {
        id: taskId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return recordActivity(transaction, {
      action: ActivityAction.TASK_DELETED,
      workspaceId: taskAccess.task.workspaceId,
      actorId: userId,
      taskId,
      metadata: {
        title: taskAccess.task.title,
      },
    });
  });

  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.taskDeleted, {
    workspaceId: taskAccess.task.workspaceId,
    taskId,
  });
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.activityCreated, {
    workspaceId: taskAccess.task.workspaceId,
    activity,
  });
};
