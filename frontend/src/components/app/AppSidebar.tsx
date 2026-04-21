"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  buildWorkspaceDetailHref,
  buildWorkspaceDirectoryHref,
  workspaceDetailViewItems,
} from "../../lib/workspaceNavigation";
import type { Workspace } from "../../types/app";

type AppSidebarProps = {
  workspaces?: Workspace[];
};

const workspaceDirectoryViews = new Set(["create", "join"]);

const configurationItems = [
  {
    href: buildWorkspaceDirectoryHref("create"),
    label: "Create Workspace",
    isActive: (pathname: string) => pathname === "/workspaces/create",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    ),
  },
  {
    href: buildWorkspaceDirectoryHref("join"),
    label: "Join Workspace",
    isActive: (pathname: string) => pathname === "/workspaces/join",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 3h5v5" />
        <path d="M8 21H3v-5" />
        <path d="M21 3 14 10" />
        <path d="m3 21 7-7" />
      </svg>
    ),
  },
] as const;



export function AppSidebar({ workspaces = [] }: AppSidebarProps) {
  const pathname = usePathname() ?? "/dashboard";
  const pathSegments = pathname.split("/").filter(Boolean);
  const workspaceDirectorySegment =
    pathSegments[0] === "workspaces" ? pathSegments[1] : undefined;
  const directoryView =
    workspaceDirectorySegment === "create" || workspaceDirectorySegment === "join"
      ? workspaceDirectorySegment
      : "list";
  const activeWorkspaceId =
    pathSegments[0] === "workspaces" &&
    workspaceDirectorySegment &&
    !workspaceDirectoryViews.has(workspaceDirectorySegment)
      ? workspaceDirectorySegment
      : null;
  const workspaceView =
    activeWorkspaceId && pathSegments[2] === "tasks"
      ? "tasks"
      : activeWorkspaceId && pathSegments[2] === "members"
        ? "members"
        : activeWorkspaceId && pathSegments[2] === "activity"
          ? "activity"
          : "overview";

  const [isWorkspacesExpanded, setIsWorkspacesExpanded] = useState(true);
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspaceId) {
      return;
    }

    setIsWorkspacesExpanded(true);
    setExpandedWorkspaceId(activeWorkspaceId);
  }, [activeWorkspaceId]);

  return (
    <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-gray-100 bg-white flex flex-col h-full">
      <Link
        href="/"
        className="flex items-center gap-3 px-6 py-8 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
      >
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="uppercase tracking-[0.15em] text-foreground text-sm font-bold">SyncSpace</span>
      </Link>

      <div className="flex-1 space-y-8 px-4 py-2">
        <section>
          <p className="px-3 text-[11px] font-bold tracking-widest text-gray-400">
            OVERVIEW
          </p>
          <ul className="mt-4 space-y-1">
            <li>
              <Link
                href="/dashboard"
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-all duration-200 ease-in-out ${
                  pathname === "/dashboard"
                    ? "bg-gray-100/80 font-medium text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={pathname === "/dashboard" ? "page" : undefined}
              >
                <span className={`shrink-0 ${pathname === "/dashboard" ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500"}`}>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 13h8V3H3z" />
                    <path d="M13 21h8v-6h-8z" />
                    <path d="M13 3h8v6h-8z" />
                    <path d="M3 21h8v-6H3z" />
                  </svg>
                </span>
                Overview
              </Link>
            </li>

            <li>
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-200 ease-in-out ${
                  pathname.startsWith("/workspaces")
                    ? "bg-gray-100/70 text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Link
                  href="/workspaces"
                  className="flex min-w-0 flex-1 items-center gap-3 text-[14px]"
                  aria-current={
                    pathname === "/workspaces" && directoryView === "list"
                      ? "page"
                      : undefined
                  }
                >
                  <span className={`shrink-0 ${pathname.startsWith("/workspaces") ? "text-gray-900" : "text-gray-400"}`}>
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                  </span>
                  <span className="truncate font-medium">Workspaces</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-500 shadow-sm">
                    {workspaces.length}
                  </span>
                </Link>

                <button
                  type="button"
                  aria-expanded={isWorkspacesExpanded}
                  aria-label={
                    isWorkspacesExpanded
                      ? "Collapse workspace navigation"
                      : "Expand workspace navigation"
                  }
                  onClick={() => setIsWorkspacesExpanded((currentValue) => !currentValue)}
                  className="rounded-md p-1 text-gray-400 transition hover:bg-white hover:text-gray-600"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-transform duration-200 ${isWorkspacesExpanded ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isWorkspacesExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="ml-[22px] mt-1 space-y-1 border-l border-gray-100 pl-4">
                    <li>
                      <Link
                        href="/workspaces"
                        className={`block rounded-lg px-3 py-1.5 text-[13px] transition-colors ${
                          pathname === "/workspaces" && directoryView === "list"
                            ? "bg-gray-50 font-medium text-gray-900"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        All Workspaces
                      </Link>
                    </li>

                    {workspaces.length === 0 ? (
                      <li className="rounded-lg px-3 py-2 text-[12px] text-gray-400">
                        No workspaces yet
                      </li>
                    ) : null}

                    {workspaces.map((workspace) => {
                      const isWorkspaceActive = activeWorkspaceId === workspace.id;
                      const isExpanded = expandedWorkspaceId === workspace.id;

                      return (
                        <li key={workspace.id}>
                          <div
                            className={`flex items-center gap-2 rounded-lg px-1 py-0.5 ${
                              isWorkspaceActive ? "bg-gray-50/80" : ""
                            }`}
                          >
                            <Link
                              href={buildWorkspaceDetailHref(workspace.id, "overview")}
                              className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-[13px] transition-colors ${
                                isWorkspaceActive
                                  ? "font-medium text-gray-900"
                                  : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              <span className="block truncate">{workspace.name}</span>
                            </Link>

                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? `Collapse ${workspace.name}`
                                  : `Expand ${workspace.name}`
                              }
                              onClick={() =>
                                setExpandedWorkspaceId((currentValue) =>
                                  currentValue === workspace.id ? null : workspace.id,
                                )
                              }
                              className="rounded-md p-1 text-gray-300 transition hover:bg-white hover:text-gray-500"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                          </div>

                          <div
                            className={`grid transition-all duration-300 ease-in-out ${
                              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <ul className="ml-[14px] mt-1 space-y-1 border-l border-gray-100 pl-3">
                                {workspaceDetailViewItems.map((item) => {
                                  const href = buildWorkspaceDetailHref(
                                    workspace.id,
                                    item.value,
                                  );
                                  const isActive =
                                    isWorkspaceActive && workspaceView === item.value;

                                  return (
                                    <li key={item.value}>
                                      <Link
                                        href={href}
                                        className={`block rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                                          isActive
                                            ? "bg-gray-50 font-medium text-gray-900"
                                            : "text-gray-500 hover:text-gray-900"
                                        }`}
                                        aria-current={isActive ? "page" : undefined}
                                      >
                                        {item.label}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section>
          <p className="px-3 text-[11px] font-bold tracking-widest text-gray-400">
            CONFIGURE
          </p>
          <ul className="mt-4 space-y-1">
            {configurationItems.map((item) => {
              const active = item.isActive(pathname);

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-all duration-200 ease-in-out ${
                      active
                        ? "bg-gray-100/80 font-medium text-gray-900"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={`shrink-0 ${active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-500"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </aside>
  );
}
