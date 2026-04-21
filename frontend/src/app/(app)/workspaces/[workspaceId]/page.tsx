import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { WorkspaceBoardClient } from "../../../../components/workspaces/WorkspaceBoardClient";
import { ApiClientError } from "../../../../lib/apiShared";
import { requireServerSession } from "../../../../lib/requireServerSession";
import { buildWorkspaceDetailHref, parseWorkspaceDetailView } from "../../../../lib/workspaceNavigation";
import { loadWorkspacePageData } from "../../../../lib/serverWorkspaceData";

type WorkspacePageProps = {
  params: Promise<{ workspaceId: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { workspaceId } = await params;
  const resolvedSearchParams = await searchParams;

  const callbackPath = `/workspaces/${workspaceId}`;
  const session = await requireServerSession(callbackPath);

  const legacyView = parseWorkspaceDetailView(resolvedSearchParams?.view);
  if (legacyView !== "overview") {
    redirect(buildWorkspaceDetailHref(workspaceId, legacyView));
  }

  try {
    const { workspace, members, tasks, activityEntries } =
      await loadWorkspacePageData(workspaceId);

    return (
      <WorkspaceBoardClient
        workspace={workspace}
        members={members}
        initialTasks={tasks}
        activityEntries={activityEntries}
        activeView="overview"
        currentUserId={session.user.id}
      />
    );
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 403 || error.status === 404)) {
      notFound();
    }

    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-800">Unable to load workspace</h1>
        <p className="mt-2 text-sm text-red-700">
          Please try again, or return to your workspace list.
        </p>
        <Link
          href="/workspaces"
          className="mt-4 inline-flex rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700"
        >
          Go to workspaces
        </Link>
      </section>
    );
  }
}
