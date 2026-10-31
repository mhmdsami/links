import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-card">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-lg font-semibold">Page not found</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          The dashboard lives at the root. Short links are served by the API.
        </p>
        <Link href="/" className="mt-6 inline-block text-[13px] text-foreground underline underline-offset-4">
          Back to links
        </Link>
      </div>
    </main>
  );
}
