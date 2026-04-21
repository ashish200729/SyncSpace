const shimmerClassName = "animate-pulse rounded-md bg-gray-100";

export function WorkspacesPageSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <div className={`h-8 w-40 ${shimmerClassName}`} />
          <div className={`mt-3 h-4 w-72 ${shimmerClassName}`} />
        </div>

        <div className="inline-flex w-full rounded-2xl border border-border bg-background p-1">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`h-10 flex-1 rounded-xl ${shimmerClassName}${index > 0 ? " ml-2" : ""}`}
            />
          ))}
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className={`h-3 w-28 ${shimmerClassName}`} />
              <div className={`h-11 w-full rounded-xl ${shimmerClassName}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className={`h-6 w-44 ${shimmerClassName}`} />
          <div className={`h-7 w-10 rounded-full ${shimmerClassName}`} />
        </div>

        <div className="grid gap-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className={`h-5 w-40 ${shimmerClassName}`} />
                  <div className={`mt-2 h-4 w-56 ${shimmerClassName}`} />
                </div>
                <div className={`h-6 w-20 rounded-full ${shimmerClassName}`} />
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[...Array(3)].map((__, metaIndex) => (
                  <div key={metaIndex} className={`h-9 rounded-xl ${shimmerClassName}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function WorkspacePageSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className={`h-3 w-24 ${shimmerClassName}`} />
            <div className={`mt-3 h-10 w-56 ${shimmerClassName}`} />
            <div className={`mt-3 h-4 w-80 max-w-full ${shimmerClassName}`} />
          </div>

          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-4">
            <div className={`h-4 w-28 ${shimmerClassName}`} />
            <div className={`mt-3 h-3 w-full ${shimmerClassName}`} />
            <div className={`mt-2 h-3 w-5/6 ${shimmerClassName}`} />
            <div className={`mt-4 h-3 w-32 ${shimmerClassName}`} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-2xl border border-border bg-background p-3">
              <div className={`h-3 w-16 ${shimmerClassName}`} />
              <div className={`mt-2 h-7 w-12 ${shimmerClassName}`} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`h-10 w-28 rounded-full ${shimmerClassName}`} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className={`h-6 w-40 ${shimmerClassName}`} />
          <div className="grid gap-3 md:grid-cols-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-2">
                <div className={`h-3 w-24 ${shimmerClassName}`} />
                <div className={`h-11 w-full rounded-xl ${shimmerClassName}`} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {[...Array(3)].map((_, columnIndex) => (
              <div
                key={columnIndex}
                className="min-h-40 rounded-2xl border border-border bg-background p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className={`h-4 w-20 ${shimmerClassName}`} />
                  <div className={`h-5 w-8 rounded-full ${shimmerClassName}`} />
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((__, cardIndex) => (
                    <div key={cardIndex} className="rounded-xl border border-border bg-card p-3">
                      <div className={`h-4 w-24 ${shimmerClassName}`} />
                      <div className={`mt-2 h-3 w-full ${shimmerClassName}`} />
                      <div className={`mt-2 h-3 w-3/4 ${shimmerClassName}`} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className={`h-6 w-36 ${shimmerClassName}`} />
          <div className="mt-4 space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="rounded-2xl border border-border bg-background p-4">
                <div className={`h-4 w-28 ${shimmerClassName}`} />
                <div className={`mt-2 h-3 w-full ${shimmerClassName}`} />
                <div className={`mt-2 h-3 w-2/3 ${shimmerClassName}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
