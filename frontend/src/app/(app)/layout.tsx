import type { ReactNode } from "react";
import { AppHeader } from "../../components/app/AppHeader";
import { AppSidebar } from "../../components/app/AppSidebar";
import { getServerSession } from "../../lib/serverSession";
import { serverApi } from "../../lib/serverApi";
import type { Workspace } from "../../types/app";
import { SidebarProvider } from "../../components/app/SidebarProvider";
import { AppLayoutClient } from "../../components/app/AppLayoutClient";

type AppLayoutProps = {
  children: ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await getServerSession();

  if (!session) {
    return children;
  }

  const workspaces = await serverApi<Workspace[]>("/api/workspaces").catch(() => []);

  return (
    <SidebarProvider>
      <AppLayoutClient
        sidebar={<AppSidebar workspaces={workspaces} />}
        header={<AppHeader initialSession={session} />}
      >
        {children}
      </AppLayoutClient>
    </SidebarProvider>
  );
}
