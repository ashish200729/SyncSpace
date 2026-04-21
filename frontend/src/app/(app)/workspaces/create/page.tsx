import { WorkspaceListClient } from "../../../../components/workspaces/WorkspaceListClient";
import { requireServerSession } from "../../../../lib/requireServerSession";
import { serverApi } from "../../../../lib/serverApi";
import type { Workspace } from "../../../../types/app";

export default async function CreateWorkspacePage() {
  await requireServerSession("/workspaces/create");
  const workspaces = await serverApi<Workspace[]>("/api/workspaces");

  return <WorkspaceListClient initialWorkspaces={workspaces} activeView="create" />;
}
