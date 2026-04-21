"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../../lib/authClient";
import { disconnectSocketClient } from "../../lib/socketClient";
import type { AuthSession } from "../../types/app";
import { useSidebar } from "./SidebarProvider";

type AppHeaderProps = {
  initialSession: AuthSession;
};

export function AppHeader({ initialSession }: AppHeaderProps) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const { toggleSidebar } = useSidebar();

  const session = sessionData ?? initialSession;

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setSignOutError("Unable to sign out right now.");
        return;
      }

      disconnectSocketClient();
      router.replace("/");
      router.refresh();
    } catch {
      setSignOutError("Unable to sign out right now.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-gray-100 bg-white h-16 shrink-0 flex items-center">
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 lg:hidden">
          <button
            onClick={toggleSidebar}
            className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
          <p className="text-[15px] font-semibold tracking-tight text-gray-900">SyncSpace</p>
        </div>

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        <div className="flex items-center gap-5">
          {signOutError ? (
            <p
              aria-live="polite"
              className="hidden text-xs font-medium text-red-600 sm:block"
            >
              {signOutError}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-2 text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" />
            </svg>
            <span className="hidden sm:inline">{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </button>

          <div className="flex h-[30px] w-[30px] cursor-default items-center justify-center rounded-full bg-rose-600 text-[13px] font-medium text-white shadow-sm ring-2 ring-white">
            {session.user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
