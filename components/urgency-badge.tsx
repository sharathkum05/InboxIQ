"use client"

import { cn } from "@/lib/utils"

type UrgencyBadgeProps = {
  urgencyScore: number
  priorityLevel: string
  className?: string
}

export function UrgencyBadge({
  urgencyScore,
  priorityLevel,
  className,
}: UrgencyBadgeProps) {
  const score = Number(urgencyScore).toFixed(1)

  if (urgencyScore >= 8 || priorityLevel === "URGENT") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium animate-pulse",
          "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#FEE2E2]/20 dark:text-red-400",
          className
        )}
      >
        <span aria-hidden>🔴</span> URGENT {score}
      </span>
    )
  }

  if (urgencyScore >= 6 || priorityLevel === "HIGH") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          "border-[#C2410C] bg-[#FED7AA] text-[#C2410C] dark:bg-[#FED7AA]/20 dark:text-orange-400",
          className
        )}
      >
        <span aria-hidden>🟠</span> HIGH {score}
      </span>
    )
  }

  if (urgencyScore >= 4 || priorityLevel === "MEDIUM") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
          "border-[#CA8A04] bg-[#FEF9C3] text-[#CA8A04] dark:bg-[#FEF9C3]/20 dark:text-yellow-600",
          className
        )}
      >
        <span aria-hidden>🟡</span> MEDIUM {score}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium",
        "border-[#64748B] bg-[#F1F5F9] text-[#64748B] dark:bg-slate-600/30 dark:text-slate-400",
        className
      )}
    >
      <span aria-hidden>⚪</span> LOW {score}
    </span>
  )
}
