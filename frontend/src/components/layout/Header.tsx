"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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
          <Link href="/features" className="hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}