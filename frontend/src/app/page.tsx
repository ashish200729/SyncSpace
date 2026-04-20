export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6 py-24 sm:py-32 lg:px-8 overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <div className="mx-auto max-w-5xl text-center" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
        <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0ms" }}>
          <p className="inline-flex items-center rounded-full bg-[#1C1C1C]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1C1C1C]/80 shadow-sm ring-1 ring-[#1C1C1C]/10">
            Welcome to SyncSpace
          </p>
        </div>
        
        <h1 
          className="mt-8 text-5xl font-bold tracking-tight text-[#1C1C1C] sm:text-7xl md:text-[6.5rem] leading-[1.05] opacity-0 animate-fade-up uppercase" 
          style={{ animationDelay: "150ms" }}
        >
          REAL-TIME<br/>TASK MANAGEMENT
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#1C1C1C]/70 sm:text-xl opacity-0 animate-fade-up" style={{ animationDelay: "300ms" }}>
          A unified workspace to manage projects, assign tasks, and communicate with your team instantly. Powered by totally seamless WebSockets.
        </p>
        
        <div className="mt-12 flex items-center justify-center gap-x-6 opacity-0 animate-fade-up" style={{ animationDelay: "450ms" }}>
          <button className="rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-premium hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300">
            Get Started
          </button>
          <button className="rounded-full border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300">
            Learn More
          </button>
        </div>
        
        <div className="mt-24 mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 text-left opacity-0 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <div className="group rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="mb-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground tracking-tight">Shared Workspaces</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Create secure environments and invite team members effortlessly via dedicated links.</p>
          </div>
          <div className="group rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="mb-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground tracking-tight">Task Tracking</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Organize your workflow. Create, assign, comment on, and track tasks to completion.</p>
          </div>
          <div className="group rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="mb-4 h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-card-foreground tracking-tight">Instant Updates</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Powered entirely by WebSockets. Every status change, assignment, and comment syncs in real time.</p>
          </div>
        </div>
      </div>
    </main>
  );
}