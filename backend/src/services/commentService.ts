import { ActivityAction, Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { emitWorkspaceEvent } from "../realtime/socketServer.js";
import { socketEvents } from "../realtime/socketEvents.js";
import { recordActivity } from "./activityService.js";
import { ensureTaskAccess } from "./workspaceAccessService.js";

const commentSelect = {
  id: true,
  taskId: true,
  workspaceId: true,
  content: true,
  isEdited: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.CommentSelect;

const serializeComment = (
  comment: Prisma.CommentGetPayload<{ select: typeof commentSelect }>,
) => ({
  id: comment.id,
  taskId: comment.taskId,
  workspaceId: comment.workspaceId,
  content: comment.content,
  isEdited: comment.isEdited,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  author: comment.author,
});

export const listComments = async (taskId: string, userId: string) => {
  const taskAccess = await ensureTaskAccess(taskId, userId);

  const comments = await prisma.comment.findMany({
    where: {
      taskId,
      workspaceId: taskAccess.task.workspaceId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: commentSelect,
  });

  return comments.map(serializeComment);
};

export const createComment = async (
  taskId: string,
  userId: string,
  content: string,
) => {
  const taskAccess = await ensureTaskAccess(taskId, userId);

  const { comment, activity } = await prisma.$transaction(async (transaction) => {
    const createdComment = await transaction.comment.create({
      data: {
        taskId,
        workspaceId: taskAccess.task.workspaceId,
        authorId: userId,
        content,
      },
      select: commentSelect,
    });

    const activity = await recordActivity(transaction, {
      action: ActivityAction.COMMENT_ADDED,
      workspaceId: taskAccess.task.workspaceId,
      actorId: userId,
      taskId,
      metadata: {
        commentId: createdComment.id,
      },
    });

    return {
      comment: createdComment,
      activity,
    };
  });

  const serializedComment = serializeComment(comment);
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.commentCreated, {
    workspaceId: taskAccess.task.workspaceId,
    taskId,
    comment: serializedComment,
  });
  emitWorkspaceEvent(taskAccess.task.workspaceId, socketEvents.activityCreated, {
    workspaceId: taskAccess.task.workspaceId,
    activity,
  });

  return serializedComment;
};
