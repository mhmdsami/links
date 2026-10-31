"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { GoogleSignIn } from "./google-signin";

export default function LoginPage() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && data) router.replace("/");
  }, [data, isPending, router]);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgb(255_255_255/7%),transparent_70%)]"
      />
      <div className="relative w-full max-w-[380px] rounded-2xl border border-border bg-card p-8 shadow-overlay">
        <Logo className="text-muted-foreground" />
        <h1 className="mt-6 text-[24px] font-semibold leading-tight tracking-[-0.03em]">Sign in</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          Manage your short links. Use the Google account tied to your links API.
        </p>
        <div className="mt-7">
          <GoogleSignIn />
        </div>
        <p className="mt-7 border-t border-border pt-4 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
          Private workspace
        </p>
      </div>
    </main>
  );
}
