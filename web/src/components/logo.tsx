import { cn } from "@/lib/utils";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-5 shrink-0", className)}
    >
      <rect
        width="32"
        height="32"
        rx="8"
        fill="#161b22"
        stroke="#30363d"
        strokeWidth="1.5"
      />
      <rect x="8" y="11" width="16" height="4" rx="2" fill="#f0f6fc" />
      <rect x="8" y="18" width="8" height="4" rx="2" fill="#8b949e" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]", className)}>
      <LogoMark />
      links
    </span>
  );
}
