import Link from "next/link";
import { buildAuthHref } from "../../lib/callback-url";
import { getServerSession } from "../../lib/server-session";
import { HeroBgAnimation } from "../../components/layout/HeroBgAnimation";

export default async function HomePage() {
  const session = await getServerSession();
  const primaryHref = session ? "/dashboard" : "/signup";
  const primaryLabel = session ? "Open Dashboard" : "Get Started";
  const secondaryHref = session ? "/#workflow" : buildAuthHref("/login", "/dashboard");
  const secondaryLabel = session ? "See How It Works" : "Log In";

  return (
    <main className="flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 lg:px-8 overflow-hidden min-h-screen border-b border-border/40">
        <HeroBgAnimation />
        <div className="mx-auto max-w-4xl text-center relative z-10" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
            <p className="inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 shadow-sm ring-1 ring-primary/10">
              Welcome to SyncSpace
            </p>
          </div>
          
          <h1 
            className="mt-8 text-5xl font-extrabold tracking-tighter text-foreground sm:text-6xl md:text-[5.5rem] leading-[1.05] opacity-0 animate-fade-up uppercase" 
            style={{ animationDelay: "150ms" }}
          >
            Keep Work<br/>Clear And Moving
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
            SyncSpace is built for teams that want less noise, sharper priorities, and one place to keep progress visible from the first idea to the final handoff.
          </p>

          {session ? (
            <p
              className="mx-auto mt-6 inline-flex items-center rounded-full border border-border/60 bg-card/80 px-4 py-2 text-sm text-foreground/80 opacity-0 animate-fade-up"
              style={{ animationDelay: "375ms" }}
            >
              Signed in as {session.user.email}
            </p>
          ) : null}
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "450ms" }}>
            <Link href={primaryHref} className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
              {primaryLabel}
            </Link>
            <Link href={secondaryHref} className="w-full sm:w-auto rounded-full border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
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
              <h3 className="text-xl font-bold text-foreground tracking-tight">Shared Focus</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Keep priorities visible, reduce context switching, and give every project a cleaner center of gravity.</p>
            </div>
            
            <div className="group rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-sm border border-border/50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Simple Progress</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Move work forward with a structure that feels straightforward, readable, and easy for the whole team to trust.</p>
            </div>

            <div className="group rounded-[2rem] border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-foreground shadow-sm border border-border/50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight">Steady Momentum</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Create a workflow that feels calm at the surface and dependable underneath, even as plans change.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="scroll-mt-28 border-t border-border/40 px-6 py-24 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 shadow-sm ring-1 ring-primary/10">
              How It Works
            </p>
            <h2 className="text-3xl font-extrabold tracking-tighter text-foreground sm:text-4xl">
              A calmer flow for modern teams
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              SyncSpace is designed to make the day feel lighter: less friction, clearer priorities, and a better sense of what deserves attention now.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70">Start clean</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Bring people into one place quickly so the work starts with clarity instead of confusion.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70">Stay aligned</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Keep progress visible so decisions feel faster and nobody loses the thread.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-bold tracking-tight text-foreground">What teams want most</h3>
            <ol className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground">
              <li>1. A clear home for every project and priority.</li>
              <li>2. A lighter way to stay aligned without extra noise.</li>
              <li>3. A workflow that helps teams move with confidence.</li>
              <li>4. A product experience that feels sharp, focused, and easy to return to every day.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
}
