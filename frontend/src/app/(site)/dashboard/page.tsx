import Link from "next/link";
import { redirect } from "next/navigation";
import { buildAuthHref } from "../../../lib/callback-url";
import { getServerSession } from "../../../lib/server-session";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect(buildAuthHref("/login", "/dashboard"));
  }

  return (
    <main className="min-h-screen bg-background px-6 pb-24 pt-32 selection:bg-primary selection:text-primary-foreground lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 opacity-0 animate-fade-up" style={{ animationDelay: "150ms" }}>
        
        {/* Back Button */}
        <div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
            Back to Home
          </Link>
        </div>

        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-card p-10 shadow-sm sm:p-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(15,118,110,0.08),_transparent_40%)]" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <p className="inline-flex items-center rounded-full bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary/80 shadow-sm ring-1 ring-primary/10">
                Dashboard
              </p>
              <h1 className="text-4xl font-extrabold tracking-tighter text-foreground sm:text-5xl">
                Welcome back, {session.user.name}.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                Your space is open and ready. This is your starting point for everything that matters next inside SyncSpace.
              </p>
            </div>

            <div className="shrink-0 rounded-3xl border border-border/70 bg-background/50 px-6 py-5 text-sm shadow-sm backdrop-blur-sm">
              <p className="font-semibold text-foreground">Signed in as</p>
              <p className="mt-1 text-muted-foreground">{session.user.email}</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
