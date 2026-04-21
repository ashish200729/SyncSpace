"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { apiClient } from "../../lib/apiClient";
import { ApiClientError } from "../../lib/apiShared";
import {
  buildWorkspaceDirectoryHref,
  type WorkspaceDirectoryView,
} from "../../lib/workspaceNavigation";
import type { JoinWorkspaceResult, Workspace } from "../../types/app";

type WorkspaceListClientProps = {
  initialWorkspaces: Workspace[];
  activeView: WorkspaceDirectoryView;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
};

export function WorkspaceListClient({
  initialWorkspaces,
  activeView,
}: WorkspaceListClientProps) {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [createError, setCreateError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isJoiningWorkspace, setIsJoiningWorkspace] = useState(false);
  const [joinError, setJoinError] = useState("");

  const sortedWorkspaces = useMemo(() => {
    return [...workspaces].sort((left, right) => {
      const leftTime = new Date(left.updatedAt).getTime();
      const rightTime = new Date(right.updatedAt).getTime();
      return rightTime - leftTime;
    });
  }, [workspaces]);

  const handleCreateWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isCreatingWorkspace) {
      return;
    }

    setCreateError("");
    setIsCreatingWorkspace(true);

    try {
      const workspace = await apiClient<Workspace>("/api/workspaces", {
        method: "POST",
        body: {
          name: workspaceName,
          description: workspaceDescription,
        },
      });

      setWorkspaces((currentWorkspaces) => [workspace, ...currentWorkspaces]);
      setWorkspaceName("");
      setWorkspaceDescription("");
      router.push(`/workspaces/${workspace.id}`);
    } catch (error) {
      setCreateError(getErrorMessage(error, "Unable to create workspace."));
    } finally {
      setIsCreatingWorkspace(false);
    }
  };

  const handleJoinWorkspace = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isJoiningWorkspace) {
      return;
    }

    setJoinError("");
    setIsJoiningWorkspace(true);

    try {
      const result = await apiClient<JoinWorkspaceResult>("/api/workspaces/join", {
        method: "POST",
        body: {
          inviteCode: inviteCode.trim().toUpperCase(),
        },
      });

      setInviteCode("");
      setWorkspaces((currentWorkspaces) => {
        if (currentWorkspaces.some((entry) => entry.id === result.workspace.id)) {
          return currentWorkspaces;
        }

        return [result.workspace, ...currentWorkspaces];
      });

      router.push(`/workspaces/${result.workspace.id}`);
    } catch (error) {
      setJoinError(getErrorMessage(error, "Unable to join this workspace."));
    } finally {
      setIsJoiningWorkspace(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspaces</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep creation, invites, and discovery in one place without losing context.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildWorkspaceDirectoryHref("create")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Create workspace
            </Link>
            <Link
              href={buildWorkspaceDirectoryHref("join")}
              className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary"
            >
              Join workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Modals for Create / Join */}
      {activeView === "create" || activeView === "join" ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <Link
            href={buildWorkspaceDirectoryHref("list")}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            aria-label="Close modal"
          />
          <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {activeView === "create" ? "Create workspace" : "Join workspace"}
              </h2>
              <Link
                href={buildWorkspaceDirectoryHref("list")}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Link>
            </div>

            {activeView === "create" ? (
              <form className="space-y-4" onSubmit={handleCreateWorkspace}>
                <div className="space-y-3">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Workspace name</span>
                    <input
                      required
                      maxLength={80}
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="Product Ops"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Description (optional)</span>
                    <textarea
                      rows={3}
                      maxLength={240}
                      value={workspaceDescription}
                      onChange={(event) => setWorkspaceDescription(event.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="Plan, track, and ship weekly initiatives."
                    />
                  </label>
                </div>

                {createError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {createError}
                  </p>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingWorkspace}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isCreatingWorkspace ? "Creating..." : "Create workspace"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleJoinWorkspace}>
                <label className="block space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Invite code</span>
                  <input
                    required
                    maxLength={32}
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm uppercase tracking-wider text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="AB12CD34"
                  />
                </label>

                {joinError ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {joinError}
                  </p>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isJoiningWorkspace}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isJoiningWorkspace ? "Joining..." : "Join workspace"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Your workspace list</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {sortedWorkspaces.length}
          </span>
        </div>

        {sortedWorkspaces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No workspaces yet. Create one to start collaborating.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedWorkspaces.map((workspace) => (
              <li key={workspace.id} className="h-full">
                <Link
                  href={`/workspaces/${workspace.id}`}
                  className="flex h-full flex-col justify-between rounded-2xl border border-border bg-background p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="line-clamp-1 text-base font-semibold text-foreground">{workspace.name}</h3>
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                          {workspace.description || "No description"}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                        {workspace.memberCount} members
                      </span>
                    </div>
                  </div>

                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/50 pt-4 text-xs text-muted-foreground sm:grid-cols-3">
                    <div>
                      <dt className="font-semibold text-foreground/80">Invite code</dt>
                      <dd className="mt-1 font-mono font-medium tracking-wide">
                        {workspace.permissions.canManageInvites
                          ? workspace.inviteCode ?? "Disabled"
                          : "Admins only"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-foreground/80">Tasks</dt>
                      <dd className="mt-1 font-medium">{workspace.taskCount}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-foreground/80">Your role</dt>
                      <dd className="mt-1 font-medium">{workspace.currentUserRole}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
