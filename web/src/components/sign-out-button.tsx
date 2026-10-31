"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-2 rounded-md text-[13px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50",
        !compact && "border border-border px-3 py-1.5 hover:border-white/25"
      )}
    >
      <LogOut className="size-3.5" aria-hidden />
      {busy ? "Signing out…" : compact ? "Sign out" : "Sign out"}
    </button>
  );
}
