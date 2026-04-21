"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarProvider";

export function AppLayoutClient({
  children,
  sidebar,
  header,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header: ReactNode;
}) {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div className="mx-auto flex min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <div
        className={`shrink-0 transition-all duration-300 ease-in-out hidden lg:block ${
          isSidebarOpen ? "w-[280px]" : "w-0 overflow-hidden"
        }`}
      >
        <div className="h-full w-[280px]">{sidebar}</div>
      </div>

      {/* Mobile/Tablet Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm transition-opacity"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
          <div className="relative flex w-full max-w-[280px] flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-full w-[280px] overflow-y-auto">{sidebar}</div>
          </div>
          <div className="w-14 shrink-0" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col bg-white">
        {header}
        <main className="flex-1 px-6 py-10 sm:px-8 lg:px-12">{children}</main>
      </div>
    </div>
  );
}
