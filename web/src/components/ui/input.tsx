import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

export function Input({ className, ...props }: ComponentPropsWithRef<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-input bg-[#010409] px-[15px] text-sm font-medium outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
