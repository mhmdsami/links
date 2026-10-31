import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]", className)}>
      <Link2 className="size-4 text-muted-foreground" aria-hidden />
      links
    </span>
  );
}
