export default function AppLevelLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <div>
          <div className="h-[28px] w-48 rounded-md bg-gray-200/60 animate-pulse"></div>
          <div className="mt-2 h-[14px] w-[250px] sm:w-[400px] rounded-md bg-gray-100 animate-pulse"></div>
        </div>
      </header>

      <section className="rounded-xl border border-gray-100 bg-white/50 p-8">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="h-[14px] w-32 rounded-md bg-gray-200/60 animate-pulse"></div>
              <div className="h-[40px] w-full rounded-lg bg-gray-100 animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
