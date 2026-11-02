import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-lg font-semibold">Page not found</h1>
        <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">
          Back to links
        </Link>
      </div>
    </main>
  );
}
