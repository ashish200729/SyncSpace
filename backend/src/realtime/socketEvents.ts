export const socketEvents = {
  workspaceJoin: "workspaceJoin",
  workspaceLeave: "workspaceLeave",
  activityCreated: "activityCreated",
  workspaceMemberJoined: "workspaceMemberJoined",
  taskCreated: "taskCreated",
  taskUpdated: "taskUpdated",
  taskDeleted: "taskDeleted",
  taskStatusChanged: "taskStatusChanged",
  commentCreated: "commentCreated",
  notificationCreated: "notificationCreated",
} as const;

export const getWorkspaceRoom = (workspaceId: string) =>
  `workspace:${workspaceId}`;

export const getUserRoom = (userId: string) => `user:${userId}`;
