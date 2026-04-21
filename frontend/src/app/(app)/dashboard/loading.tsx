export default function DashboardLoading() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center gap-3">
        <div>
          <div className="h-[28px] w-32 rounded-md bg-gray-200/60 animate-pulse"></div>
          <div className="mt-2 h-[14px] w-[300px] sm:w-[450px] rounded-md bg-gray-100 animate-pulse"></div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <article key={i} className="rounded-xl border border-gray-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="h-[13px] w-24 rounded-md bg-gray-100 animate-pulse"></div>
              <div className="h-[18px] w-[18px] rounded-sm bg-gray-100 animate-pulse"></div>
            </div>
            <div className="mt-4 h-[38px] w-[60px] rounded-lg bg-gray-200/60 animate-pulse"></div>
            <div className="mt-3 h-[13px] w-48 rounded-md bg-gray-100 animate-pulse"></div>
          </article>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between pb-4">
          <div className="h-[20px] w-36 rounded-md bg-gray-200/60 animate-pulse"></div>
          <div className="h-[14px] w-16 rounded-md bg-gray-100 animate-pulse"></div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <li key={i}>
              <div className="group block h-full rounded-xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-gray-100 animate-pulse shrink-0"></div>
                    <div className="h-[15px] w-28 rounded-md bg-gray-200/60 animate-pulse"></div>
                  </div>
                  <div className="h-4 w-4 rounded-sm bg-gray-100 animate-pulse"></div>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="h-[13px] w-full rounded-md bg-gray-100 animate-pulse"></div>
                  <div className="h-[13px] w-4/5 rounded-md bg-gray-100 animate-pulse"></div>
                </div>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-[12px] w-20 rounded-md bg-gray-100 animate-pulse"></div>
                  <div className="h-[12px] w-16 rounded-md bg-gray-100 animate-pulse"></div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
