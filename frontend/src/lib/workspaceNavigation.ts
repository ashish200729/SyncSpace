export type WorkspaceDirectoryView = "list" | "create" | "join";
export type WorkspaceDetailView = "overview" | "tasks" | "members" | "activity";

export const workspaceDirectoryViewItems = [
  {
    value: "list",
    label: "All Workspaces",
  },
  {
    value: "create",
    label: "Create",
  },
  {
    value: "join",
    label: "Join",
  },
] as const satisfies ReadonlyArray<{
  value: WorkspaceDirectoryView;
  label: string;
}>;

export const workspaceDetailViewItems = [
  {
    value: "overview",
    label: "Overview",
  },
  {
    value: "tasks",
    label: "Tasks",
  },
  {
    value: "members",
    label: "Members",
  },
  {
    value: "activity",
    label: "Activity",
  },
] as const satisfies ReadonlyArray<{
  value: WorkspaceDetailView;
  label: string;
}>;

export const parseWorkspaceDirectoryView = (
  value?: string | null,
): WorkspaceDirectoryView => {
  if (value === "create" || value === "join") {
    return value;
  }

  return "list";
};

export const parseWorkspaceDetailView = (
  value?: string | null,
): WorkspaceDetailView => {
  if (value === "tasks" || value === "members" || value === "activity") {
    return value;
  }

  return "overview";
};

export const buildWorkspaceDirectoryHref = (
  view: WorkspaceDirectoryView,
): string => {
  if (view === "list") {
    return "/workspaces";
  }

  return `/workspaces/${view}`;
};

export const buildWorkspaceDetailHref = (
  workspaceId: string,
  view: WorkspaceDetailView,
): string => {
  if (view === "overview") {
    return `/workspaces/${workspaceId}`;
  }

  return `/workspaces/${workspaceId}/${view}`;
};
