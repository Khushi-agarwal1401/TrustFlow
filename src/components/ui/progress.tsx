import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  variant?: "default" | "success" | "warning" | "danger" | "accent"
  size?: "sm" | "md" | "lg"
  label?: string
  showValue?: boolean
  indeterminate?: boolean
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

const variantMap = {
  default: "bg-[var(--color-bg-elevated)]",
  success: "bg-[var(--color-success-subtle)]",
  warning: "bg-[var(--color-warning-subtle)]",
  danger: "bg-[var(--color-danger-subtle)]",
  accent: "bg-[var(--color-accent-subtle)]",
}

const fillMap = {
  default: "bg-[var(--color-text-muted)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
  accent: "bg-[var(--color-accent-primary)]",
}

function Progress({ className, value = 0, max = 100, variant = "accent", size = "md", label, showValue = false, indeterminate = false, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>}
          {showValue && <span className="text-xs font-medium text-[var(--color-text-secondary)] tabular-nums">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", variantMap[variant], sizeMap[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            fillMap[variant],
            indeterminate && "animate-progress-indeterminate w-1/2"
          )}
          style={indeterminate ? {} : { width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { Progress }
