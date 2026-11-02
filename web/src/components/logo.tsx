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
      <path
        d="M13.4 18.6a4 4 0 0 1 0-5.7l3-3a4 4 0 1 1 5.7 5.7l-1.6 1.6"
        fill="none"
        stroke="#f0f6fc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.6 13.4a4 4 0 0 1 0 5.7l-3 3a4 4 0 1 1-5.7-5.7l1.6-1.6"
        fill="none"
        stroke="#8b949e"
        strokeWidth="2"
        strokeLinecap="round"
      />
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
