import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

export function Label({ className, ...props }: ComponentPropsWithRef<"label">) {
  return <label className={cn("text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground", className)} {...props} />;
}
