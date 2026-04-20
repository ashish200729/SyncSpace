import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-8 text-sm">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Brand */}
          <Link 
            href="/" 
            className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
            style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
          >
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="uppercase tracking-[0.15em] text-foreground text-xs font-bold">SyncSpace</span>
          </Link>

          {/* Minimal Links */}
          <nav className="flex items-center gap-6 font-medium text-muted-foreground/80">
            <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </nav>

          {/* Copyright vs Socials */}
          <div className="flex items-center gap-6 text-muted-foreground/60 text-xs">
            <p>© {new Date().getFullYear()} SyncSpace.</p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/ashish200729/SyncSpace" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
