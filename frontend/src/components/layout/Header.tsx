"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";
import type { AuthSession } from "../../lib/auth-session";

type HeaderProps = {
  initialSession: AuthSession | null;
};

export function Header({ initialSession }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: sessionData, isPending } = authClient.useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const session = isPending ? initialSession : sessionData;
  const isAuthenticated = Boolean(session?.user);
  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Dashboard" : "Log in";

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

      router.replace("/");
      router.refresh();
    } catch {
      setSignOutError("Unable to sign out right now.");
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    let rafId: number;

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 10 || document.documentElement.scrollTop > 10);
      });
    };
    
    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-[100] transition-colors duration-500 ease-in-out border-b ${
        isMounted && isScrolled
          ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: Brand Name */}
        <Link 
          href="/" 
          className="flex items-center gap-3 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="uppercase tracking-[0.15em] text-foreground text-sm font-bold">SyncSpace</span>
        </Link>
        
        {/* Center: Minimal Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
          <Link href="/#features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#workflow" className="hover:text-foreground transition-colors">
            How it works
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3">
                <div className="hidden text-right lg:block">
                  <p className="text-sm text-foreground/60">{session?.user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </div>
              {signOutError ? (
                <p className="text-xs text-red-600">{signOutError}</p>
              ) : null}
            </div>
          ) : null}
          <Link 
            href={primaryHref}
            aria-current={pathname === "/dashboard" && isAuthenticated ? "page" : undefined}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          >
            {primaryLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
