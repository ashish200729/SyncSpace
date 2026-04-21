import Link from "next/link";
import { requireServerSession } from "../../../lib/requireServerSession";
import { serverApi } from "../../../lib/serverApi";
import type { Workspace } from "../../../types/app";

export default async function DashboardPage() {
  await requireServerSession("/dashboard");
  const workspaces = await serverApi<Workspace[]>("/api/workspaces");

  const totalTasks = workspaces.reduce((sum, workspace) => sum + workspace.taskCount, 0);
  const totalMembers = workspaces.reduce(
    (sum, workspace) => sum + workspace.memberCount,
    0,
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Overview
          </h1>
          <p className="max-w-2xl text-[14px] text-gray-500 mt-1">
            Manage your task completion, active workspaces, and recent collaboration activity.
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Card 1 */}
        <article className="rounded-xl border border-gray-200/80 bg-white p-6 transition-all hover:shadow-md hover:border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-gray-500">Active Workspaces</p>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
          <p className="mt-4 text-[32px] font-semibold tracking-tight text-gray-900">{workspaces.length}</p>
          <p className="mt-2 text-[13px] text-gray-500">Currently active and accessible</p>
        </article>

        {/* Metric Card 2 */}
        <article className="rounded-xl border border-gray-200/80 bg-white p-6 transition-all hover:shadow-md hover:border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-gray-500">Total Tasks</p>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <p className="mt-4 text-[32px] font-semibold tracking-tight text-gray-900">{totalTasks}</p>
          <p className="mt-2 text-[13px] text-gray-500">Across all accessible workspaces</p>
        </article>

        {/* Metric Card 3 */}
        <article className="rounded-xl border border-gray-200/80 bg-white p-6 transition-all hover:shadow-md hover:border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-gray-500">Network Members</p>
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="mt-4 text-[32px] font-semibold tracking-tight text-gray-900">{totalMembers}</p>
          <p className="mt-2 text-[13px] text-gray-500">Collaborators sharing projects</p>
        </article>
      </section>

      <section>
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Workspaces</h3>
          <Link
            href="/workspaces"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50/80 mb-4 ring-1 ring-gray-100">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold tracking-tight text-gray-900">No workspaces yet</h3>
            <p className="mt-1.5 text-[13px] text-gray-500 max-w-sm">
              Create a new workspace to start tracking tasks and collaborating with your team.
            </p>
            <div className="mt-6">
              <Link
                href="/workspaces/create"
                className="inline-flex items-center rounded-full bg-gray-900 px-5 py-2 text-[13px] font-medium text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                Create workspace
              </Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.slice(0, 6).map((workspace) => (
              <li key={workspace.id}>
                <Link
                  href={`/workspaces/${workspace.id}`}
                  className="group block h-full rounded-xl border border-gray-200/80 bg-white p-5 transition-all hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-100 bg-gray-50/50">
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-[15px] font-semibold tracking-tight text-gray-900 truncate">
                        {workspace.name}
                      </h4>
                    </div>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-500 line-clamp-2 mt-1">
                    {workspace.description || "No description provided."}
                  </p>
                  <div className="mt-5 flex items-center gap-4 text-[12px] font-medium text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      {workspace.memberCount} members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {workspace.taskCount} tasks
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
