import { randomBytes } from "node:crypto";

const slugify = (value: string) => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "workspace";
};

export const createWorkspaceSlug = (name: string) => {
  const base = slugify(name).slice(0, 48).replace(/-+$/g, "");
  return `${base}-${randomBytes(3).toString("hex")}`;
};
