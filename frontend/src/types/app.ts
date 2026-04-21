export type AuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

export type UserSummary = {
  id: string;
  name: string;
  email: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  inviteCode?: string | null;
  inviteLink?: string | null;
  inviteEnabled: boolean;
  inviteExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner: UserSummary;
  currentUserRole: "ADMIN" | "MEMBER";
  permissions: {
    canCreateTasks: boolean;
    canManageInvites: boolean;
    canManageWorkspace: boolean;
  };
  memberCount: number;
  taskCount: number;
};

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  user: UserSummary;
};

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Task = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  creator: UserSummary;
  assignee?: UserSummary | null;
  assigneeId?: string | null;
  commentCount: number;
};

export type Comment = {
  id: string;
  taskId: string;
  workspaceId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: UserSummary;
};

export type ActivityEntry = {
  id: string;
  action: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor: UserSummary;
  task?: {
    id: string;
    title: string;
  } | null;
};

export type JoinWorkspaceResult = {
  workspace: Workspace;
  alreadyMember: boolean;
};

export type WorkspaceJoinAcknowledgeResponse = {
  ok: boolean;
  message?: string;
};

export type TaskEventPayload = {
  workspaceId: string;
  task: Task;
};

export type TaskDeletedEventPayload = {
  workspaceId: string;
  taskId: string;
};

export type CommentCreatedEventPayload = {
  workspaceId: string;
  taskId: string;
  comment: Comment;
};

export type ActivityCreatedEventPayload = {
  workspaceId: string;
  activity: ActivityEntry;
};

export type WorkspaceMemberJoinedEventPayload = {
  workspaceId: string;
  member: WorkspaceMember;
};

export type SocketServerToClientEvents = {
  activityCreated: (payload: ActivityCreatedEventPayload) => void;
  workspaceMemberJoined: (payload: WorkspaceMemberJoinedEventPayload) => void;
  taskCreated: (payload: TaskEventPayload) => void;
  taskUpdated: (payload: TaskEventPayload) => void;
  taskDeleted: (payload: TaskDeletedEventPayload) => void;
  taskStatusChanged: (payload: TaskEventPayload) => void;
  commentCreated: (payload: CommentCreatedEventPayload) => void;
};

export type SocketClientToServerEvents = {
  workspaceJoin: (
    workspaceId: string,
    acknowledge?: (response: WorkspaceJoinAcknowledgeResponse) => void,
  ) => void;
};
