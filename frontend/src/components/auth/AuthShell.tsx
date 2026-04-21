import Link from "next/link";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerHref: string;
  footerLinkLabel: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  footerText,
  footerHref,
  footerLinkLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      <section className="relative flex flex-col items-center justify-center px-6 lg:px-8 overflow-hidden min-h-screen">
        <div className="mx-auto w-full max-w-md text-center opacity-0 animate-fade-up" style={{ animationDelay: "150ms", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <div className="mb-8 flex justify-center">
            <Link 
              href="/" 
              className="flex items-center justify-center gap-3 text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
              style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="uppercase tracking-[0.15em] text-foreground text-sm font-bold">SyncSpace</span>
            </Link>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>

          <div style={{ fontFamily: 'inherit' }} className="mt-10 text-left rounded-[2rem] border border-border bg-card p-8 sm:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
            {children}
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            {footerText}{" "}
            <Link
              href={footerHref}
              className="font-semibold text-foreground transition hover:text-primary underline underline-offset-4"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
