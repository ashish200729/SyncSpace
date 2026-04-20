export default function HomePage() {
  return (
    <main className="flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 lg:px-8 overflow-hidden min-h-screen border-b border-border/40">
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

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
            A unified workspace to manage projects, assign tasks, and communicate with your team instantly. Powered by totally seamless WebSockets.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "450ms" }}>
            <button className="w-full sm:w-auto rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
              Get Started
            </button>
            <button className="w-full sm:w-auto rounded-full border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors">
              Learn More
            </button>
          </div>
        
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-32 lg:px-8 bg-zinc-50/30">
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
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/90">Powered entirely by WebSockets. Every status change, assignment, and comment syncs in real time.</p>
            </div>

          </div>
        </div>
      </section>
      
    </main>
  );
}