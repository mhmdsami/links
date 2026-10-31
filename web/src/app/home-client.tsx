"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "./dashboard";
import { authClient } from "@/lib/auth-client";

export function HomeClient() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !data) {
      router.replace("/login");
      router.refresh();
    }
  }, [data, isPending, router]);

  if (isPending || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        Checking your session…
      </div>
    );
  }

  return <Dashboard user={data.user} />;
}
