import "server-only";

import { serverApi } from "./serverApi";
import type {
  ActivityEntry,
  Task,
  Workspace,
  WorkspaceMember,
} from "../types/app";

export const loadWorkspacePageData = async (workspaceId: string) => {
  const [workspace, members, tasks, activityEntries] = await Promise.all([
    serverApi<Workspace>(`/api/workspaces/${workspaceId}`),
    serverApi<WorkspaceMember[]>(`/api/workspaces/${workspaceId}/members`),
    serverApi<Task[]>(`/api/workspaces/${workspaceId}/tasks`),
    serverApi<ActivityEntry[]>(`/api/workspaces/${workspaceId}/activity`),
  ]);

  return {
    workspace,
    members,
    tasks,
    activityEntries,
  };
};
