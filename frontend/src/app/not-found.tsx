export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-16 text-center">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Page not found
        </h1>
        <p className="text-sm leading-6 text-gray-600">
          The page you were looking for could not be found.
        </p>
      </div>
    </main>
  );
}
