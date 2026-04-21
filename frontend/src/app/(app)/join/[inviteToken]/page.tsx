import Link from "next/link";
import { redirect } from "next/navigation";
import { ApiClientError } from "../../../../lib/apiShared";
import { requireServerSession } from "../../../../lib/requireServerSession";
import { serverApi } from "../../../../lib/serverApi";
import type { JoinWorkspaceResult } from "../../../../types/app";

type JoinWorkspaceByInvitePageProps = {
  params: Promise<{ inviteToken: string }>;
};

export default async function JoinWorkspaceByInvitePage({
  params,
}: JoinWorkspaceByInvitePageProps) {
  const { inviteToken } = await params;
  await requireServerSession(`/join/${inviteToken}`);

  try {
    const result = await serverApi<JoinWorkspaceResult>("/api/workspaces/join", {
      method: "POST",
      body: {
        inviteToken: inviteToken,
      },
    });

    redirect(`/workspaces/${result.workspace.id}`);
  } catch (error) {
    const errorMessage =
      error instanceof ApiClientError
        ? error.message
        : "Unable to join workspace with this invite link.";

    return (
      <section className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Invite link unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/workspaces"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Go to workspaces
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }
}
