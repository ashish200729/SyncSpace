import { NotificationType, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { ApiError } from "../errors/apiError.js";
import { emitUserEvent } from "../realtime/socketServer.js";
import { socketEvents } from "../realtime/socketEvents.js";

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  isRead: true,
  readAt: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  task: {
    select: {
      id: true,
      title: true,
    },
  },
  workspace: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.NotificationSelect;

const serializeNotification = (
  notification: Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>,
) => ({
  id: notification.id,
  type: notification.type,
  title: notification.title,
  message: notification.body ?? null,
  isRead: notification.isRead,
  readAt: notification.readAt,
  createdAt: notification.createdAt,
  actor: notification.actor,
  task: notification.task,
  workspace: notification.workspace,
});

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  taskId?: string | null;
  workspaceId?: string | null;
  actorId?: string | null;
};

type TaskAssignedNotificationInput = {
  recipientUserId: string;
  actorUserId: string;
  taskId: string;
  workspaceId: string;
  taskTitle: string;
};

type CommentNotificationInput = {
  recipientUserIds: string[];
  actorUserId: string;
  taskId: string;
  workspaceId: string;
  taskTitle: string;
};

export type NotificationDelivery = {
  recipientUserId: string;
  notification: ReturnType<typeof serializeNotification>;
};

export const listNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isRead: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
    take: 12,
    select: notificationSelect,
  });

  return notifications.map(serializeNotification);
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string,
) => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: notificationSelect,
  });

  if (!notification) {
    throw ApiError.notFound("Notification not found.");
  }

  if (notification.isRead) {
    return serializeNotification(notification);
  }

  const updatedNotification = await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
    select: notificationSelect,
  });

  return serializeNotification(updatedNotification);
};

export const createNotificationRecord = async (
  client: PrismaClientLike,
  input: CreateNotificationInput,
) => {
  const notification = await client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.message ?? undefined,
      taskId: input.taskId ?? undefined,
      workspaceId: input.workspaceId ?? undefined,
      actorId: input.actorId ?? undefined,
    },
    select: notificationSelect,
  });

  return serializeNotification(notification);
};

export const createTaskAssignedNotificationRecord = async (
  client: PrismaClientLike,
  input: TaskAssignedNotificationInput,
) => {
  if (input.recipientUserId === input.actorUserId) {
    return null;
  }

  return createNotificationRecord(client, {
    userId: input.recipientUserId,
    type: "TASK_ASSIGNED",
    title: "New task assignment",
    message: `You were assigned to "${input.taskTitle}".`,
    taskId: input.taskId,
    workspaceId: input.workspaceId,
    actorId: input.actorUserId,
  });
};

export const createCommentNotificationRecords = async (
  client: PrismaClientLike,
  input: CommentNotificationInput,
) => {
  const recipientUserIds = [...new Set(input.recipientUserIds)].filter(
    (recipientUserId) => recipientUserId !== input.actorUserId,
  );

  const notifications = await Promise.all(
    recipientUserIds.map((recipientUserId) =>
      createNotificationRecord(client, {
        userId: recipientUserId,
        type: "TASK_COMMENTED",
        title: "New comment on a task",
        message: `A new comment was added to "${input.taskTitle}".`,
        taskId: input.taskId,
        workspaceId: input.workspaceId,
        actorId: input.actorUserId,
      }).then((notification) => ({
        recipientUserId,
        notification,
      })),
    ),
  );

  return notifications;
};

export const emitNotificationCreated = (
  userId: string,
  notification: ReturnType<typeof serializeNotification>,
) => {
  emitUserEvent(userId, socketEvents.notificationCreated, {
    notification,
  });
};
