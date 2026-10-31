import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-lg border border-input bg-background/60 px-3 text-sm outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-muted-foreground/70 hover:border-white/25 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
