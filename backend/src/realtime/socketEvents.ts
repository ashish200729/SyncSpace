export const socketEvents = {
  workspaceJoin: "workspaceJoin",
  activityCreated: "activityCreated",
  workspaceMemberJoined: "workspaceMemberJoined",
  taskCreated: "taskCreated",
  taskUpdated: "taskUpdated",
  taskDeleted: "taskDeleted",
  taskStatusChanged: "taskStatusChanged",
  commentCreated: "commentCreated",
} as const;

export const getWorkspaceRoom = (workspaceId: string) =>
  `workspace:${workspaceId}`;

export const getUserRoom = (userId: string) => `user:${userId}`;
