"use client";

type ErrorPageProps = {
  error: Error;
  reset: () => void;
};

export default function ErrorPage({ error: _error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          500
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Something went wrong
        </h1>
        <p className="text-sm leading-6 text-gray-600">
          The page could not be loaded right now. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
