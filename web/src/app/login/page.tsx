"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { LOCAL_PREVIEW } from "@/lib/local-preview";
import { GoogleSignIn } from "./google-signin";

export default function LoginPage() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (LOCAL_PREVIEW || (!isPending && data)) router.replace("/");
  }, [data, isPending, router]);

  if (LOCAL_PREVIEW) return null;

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6">
        <Logo />
        <h1 className="mt-5 text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Continue with Google to manage your links.</p>
        <div className="mt-6">
          <GoogleSignIn />
        </div>
      </div>
    </main>
  );
}
