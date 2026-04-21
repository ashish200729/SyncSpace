import { redirect } from "next/navigation";
import { WorkspaceListClient } from "../../../components/workspaces/WorkspaceListClient";
import { requireServerSession } from "../../../lib/requireServerSession";
import { serverApi } from "../../../lib/serverApi";
import { buildWorkspaceDirectoryHref, parseWorkspaceDirectoryView } from "../../../lib/workspaceNavigation";
import type { Workspace } from "../../../types/app";

type WorkspacesPageProps = {
  searchParams?: Promise<{ view?: string }>;
};

export default async function WorkspacesPage({ searchParams }: WorkspacesPageProps) {
  await requireServerSession("/workspaces");
  const resolvedSearchParams = await searchParams;

  const legacyView = parseWorkspaceDirectoryView(resolvedSearchParams?.view);
  if (legacyView !== "list") {
    redirect(buildWorkspaceDirectoryHref(legacyView));
  }

  const workspaces = await serverApi<Workspace[]>("/api/workspaces");

  return <WorkspaceListClient initialWorkspaces={workspaces} activeView="list" />;
}
