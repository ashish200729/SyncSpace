import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceBoardClient } from "../../../../../components/workspaces/WorkspaceBoardClient";
import { ApiClientError } from "../../../../../lib/apiShared";
import { requireServerSession } from "../../../../../lib/requireServerSession";
import { loadWorkspacePageData } from "../../../../../lib/serverWorkspaceData";

type WorkspaceTasksPageProps = {
  params: Promise<{ workspaceId: string }>;
};

export default async function WorkspaceTasksPage({
  params,
}: WorkspaceTasksPageProps) {
  const { workspaceId } = await params;
  const callbackPath = `/workspaces/${workspaceId}/tasks`;
  const session = await requireServerSession(callbackPath);

  try {
    const { workspace, members, tasks, activityEntries } =
      await loadWorkspacePageData(workspaceId);

    return (
      <WorkspaceBoardClient
        workspace={workspace}
        members={members}
        initialTasks={tasks}
        activityEntries={activityEntries}
        activeView="tasks"
        currentUserId={session.user.id}
      />
    );
  } catch (error) {
    if (error instanceof ApiClientError && (error.status === 403 || error.status === 404)) {
      notFound();
    }

    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-semibold text-red-800">Unable to load workspace tasks</h1>
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
