import Link from "next/link";
import { buildAuthHref } from "../../lib/callbackUrl";
import { getServerSession } from "../../lib/serverSession";

export default async function HomePage() {
  const session = await getServerSession();
  const primaryHref = session ? "/dashboard" : "/signup";
  const primaryLabel = session ? "Open Dashboard" : "Get Started";
  const secondaryHref = session ? "/#features" : buildAuthHref("/login", "/dashboard");
  const secondaryLabel = session ? "Features" : "Log In";

  return (
    <main className="flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden border-b border-border/40 px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
            <p className="inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 shadow-sm ring-1 ring-primary/10">
              Welcome to SyncSpace
            </p>
          </div>
          
          <h1 
            className="mt-8 text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-[5.5rem] leading-[1.05] opacity-0 animate-fade-up uppercase" 
            style={{ animationDelay: "150ms" }}
          >
            Real-Time<br/>Task Management
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground opacity-0 animate-fade-up sm:text-xl" style={{ animationDelay: "300ms" }}>
            A unified workspace to manage projects, assign tasks, and keep every teammate aligned the moment work changes.
          </p>

          {session ? (
            <p
              className="mx-auto mt-6 inline-flex items-center rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm text-foreground/80 opacity-0 animate-fade-up"
              style={{ animationDelay: "375ms" }}
            >
              Signed in as {session.user.email}
            </p>
          ) : null}
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 opacity-0 animate-fade-up sm:flex-row" style={{ animationDelay: "450ms" }}>
            <Link href={primaryHref} className="w-full rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="w-full rounded-full border border-border bg-card/50 px-8 py-4 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto">
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="scroll-mt-28 px-6 py-32 lg:px-8 bg-zinc-50/30">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
            <div className="group rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-sm border border-border/50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Shared Workspaces</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Create secure environments and invite team members effortlessly via dedicated links.</p>
            </div>
            
            <div className="group rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-sm border border-border/50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Task Tracking</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Organize your workflow. Create, assign, comment on, and track tasks to completion.</p>
            </div>

            <div className="group rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-sm border border-border/50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Instant Updates</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Status changes, new comments, and fresh assignments appear across the team without manual refreshes.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-28 border-t border-border/50 bg-background px-6 py-28 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/70">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Move work forward without losing context.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              SyncSpace keeps planning, ownership, and follow-through in one shared flow so teams can see what matters and act quickly.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                title: "Start a workspace",
                description:
                  "Create a space for a project, invite teammates, and keep everyone aligned on one shared source of truth.",
              },
              {
                title: "Plan the next tasks",
                description:
                  "Break work into clear tasks, assign owners, and add the notes people need before they begin.",
              },
              {
                title: "Stay in sync",
                description:
                  "See progress unfold as teammates update status, leave comments, and unblock one another throughout the day.",
              },
            ].map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
