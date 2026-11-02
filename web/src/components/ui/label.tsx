import { cn } from "@/lib/utils";
import type { ComponentPropsWithRef } from "react";

export function Label({ className, ...props }: ComponentPropsWithRef<"label">) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
