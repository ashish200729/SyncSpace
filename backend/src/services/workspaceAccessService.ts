import prisma from "../config/prisma.js";
import { ApiError } from "../errors/apiError.js";

const activeMembershipWhere = (workspaceId: string, userId: string) => ({
  workspaceId,
  userId,
  leftAt: null,
});

const isWorkspaceAdmin = (role: "ADMIN" | "MEMBER") => role === "ADMIN";

export const ensureWorkspaceMember = async (
  workspaceId: string,
  userId: string,
) => {
  const workspace = await prisma.workspace.findUnique({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      ownerId: true,
      inviteCode: true,
      inviteToken: true,
      inviteEnabled: true,
      inviteExpiresAt: true,
      createdAt: true,
      updatedAt: true,
      description: true,
    },
  });

  if (!workspace) {
    throw ApiError.notFound("Workspace not found.");
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: activeMembershipWhere(workspaceId, userId),
    select: {
      id: true,
      workspaceId: true,
      userId: true,
      role: true,
      joinedAt: true,
    },
  });

  if (!membership) {
    throw ApiError.forbidden("You do not have access to this workspace.");
  }

  return {
    workspace,
    membership,
  };
};

export const ensureWorkspaceAssignee = async (
  workspaceId: string,
  userId: string,
) => {
  const membership = await prisma.workspaceMember.findFirst({
    where: activeMembershipWhere(workspaceId, userId),
    select: {
      id: true,
      userId: true,
      role: true,
    },
  });

  if (!membership) {
    throw ApiError.badRequest("Assigned user must already belong to the workspace.");
  }

  return membership;
};

export const ensureTaskAccess = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    select: {
      id: true,
      workspaceId: true,
      title: true,
      creatorId: true,
      assigneeId: true,
      status: true,
      deletedAt: true,
    },
  });

  if (!task || task.deletedAt) {
    throw ApiError.notFound("Task not found.");
  }

  const workspaceAccess = await ensureWorkspaceMember(task.workspaceId, userId);

  return {
    task,
    ...workspaceAccess,
  };
};

export const ensureWorkspaceAdmin = async (workspaceId: string, userId: string) => {
  const workspaceAccess = await ensureWorkspaceMember(workspaceId, userId);

  if (!isWorkspaceAdmin(workspaceAccess.membership.role)) {
    throw ApiError.forbidden("Only workspace admins can perform this action.");
  }

  return workspaceAccess;
};

export const ensureTaskDetailsEditable = async (taskId: string, userId: string) => {
  const taskAccess = await ensureTaskAccess(taskId, userId);

  if (
    !isWorkspaceAdmin(taskAccess.membership.role) &&
    taskAccess.task.creatorId !== userId
  ) {
    throw ApiError.forbidden(
      "Only workspace admins or the task creator can edit task details.",
    );
  }

  return taskAccess;
};

export const ensureTaskStatusEditable = async (taskId: string, userId: string) => {
  const taskAccess = await ensureTaskAccess(taskId, userId);

  if (
    !isWorkspaceAdmin(taskAccess.membership.role) &&
    taskAccess.task.creatorId !== userId &&
    taskAccess.task.assigneeId !== userId
  ) {
    throw ApiError.forbidden(
      "Only workspace admins, the task creator, or the assignee can change task status.",
    );
  }

  return taskAccess;
};

export const ensureTaskDeletable = async (taskId: string, userId: string) => {
  const taskAccess = await ensureTaskAccess(taskId, userId);

  if (
    !isWorkspaceAdmin(taskAccess.membership.role) &&
    taskAccess.task.creatorId !== userId
  ) {
    throw ApiError.forbidden(
      "Only workspace admins or the task creator can delete this task.",
    );
  }

  return taskAccess;
};
