import "server-only";

import { redirect } from "next/navigation";
import { buildAuthHref } from "./callbackUrl";
import { getServerSession } from "./serverSession";

export const requireServerSession = async (callbackPath: string) => {
  const session = await getServerSession();

  if (!session) {
    redirect(buildAuthHref("/login", callbackPath));
  }

  return session;
};
