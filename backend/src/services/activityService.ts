import type { ActivityAction, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { ensureWorkspaceMember } from "./workspaceAccessService.js";

type PrismaClientLike = Prisma.TransactionClient | typeof prisma;

type RecordActivityInput = {
  action: ActivityAction;
  workspaceId: string;
  actorId: string;
  taskId?: string | null;
  metadata?: Prisma.InputJsonValue;
};

const activitySelect = {
  id: true,
  action: true,
  taskId: true,
  metadata: true,
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
} satisfies Prisma.ActivityLogSelect;

const serializeActivityEntry = (
  entry: Prisma.ActivityLogGetPayload<{ select: typeof activitySelect }>,
) => ({
  id: entry.id,
  action: entry.action,
  metadata: entry.metadata,
  createdAt: entry.createdAt,
  actor: entry.actor,
  task: entry.task,
});

export const recordActivity = async (
  client: PrismaClientLike,
  { action, workspaceId, actorId, taskId, metadata }: RecordActivityInput,
) => {
  const entry = await client.activityLog.create({
    data: {
      action,
      workspaceId,
      actorId,
      taskId: taskId ?? undefined,
      metadata,
    },
    select: activitySelect,
  });

  return serializeActivityEntry(entry);
};

export const listWorkspaceActivity = async (
  workspaceId: string,
  userId: string,
) => {
  await ensureWorkspaceMember(workspaceId, userId);

  const activityEntries = await prisma.activityLog.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 12,
    select: activitySelect,
  });

  return activityEntries.map(serializeActivityEntry);
};
