import { cn } from "@/lib/utils";

export const AnimatedTrashBin = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("text-destructive size-5", className)}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trash bin body */}
      <path
        d="M4 7h16l-1 12a2 2 0 01-2 2H7a2 2 0 01-2-2L4 7z"
        fill="currentColor"
        opacity="0.7"
      />
      {/* Trash bin lines */}
      <path
        d="M9 11l6 6"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 11l-6 6"
        stroke="#ef4444"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Lid */}
      <path
        d="M3 7h18 M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="wiggle-animation"
      />
    </svg>
  );
};
