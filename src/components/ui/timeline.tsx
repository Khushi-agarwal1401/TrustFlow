import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

interface TimelineItem {
  id: string
  title: string
  description?: string
  status: "pending" | "active" | "completed" | "error" | "warning"
  date?: string
  amount?: number
  actions?: React.ReactNode
}

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[]
}

const statusConfig = {
  pending: { dot: "bg-[var(--color-text-muted)]", line: "bg-[var(--color-border-subtle)]", badge: "default" as const, label: "Pending" },
  active: { dot: "bg-[var(--color-info)] ring-4 ring-[var(--color-info-subtle)]", line: "bg-[var(--color-info)]", badge: "info" as const, label: "In Progress" },
  completed: { dot: "bg-[var(--color-success)] ring-4 ring-[var(--color-success-subtle)]", line: "bg-[var(--color-success)]", badge: "success" as const, label: "Completed" },
  error: { dot: "bg-[var(--color-danger)] ring-4 ring-[var(--color-danger-subtle)]", line: "bg-[var(--color-danger)]", badge: "danger" as const, label: "Error" },
  warning: { dot: "bg-[var(--color-warning)] ring-4 ring-[var(--color-warning-subtle)]", line: "bg-[var(--color-warning)]", badge: "warning" as const, label: "Warning" },
}

function Timeline({ className, items, ...props }: TimelineProps) {
  return (
    <div className={cn("space-y-0", className)} {...props}>
      {items.map((item, i) => {
        const config = statusConfig[item.status]
        const isLast = i === items.length - 1

        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div className={cn("w-3 h-3 rounded-full shrink-0 z-10 transition-all duration-300", config.dot)} />
              {!isLast && (
                <div className={cn("w-px flex-1 mt-1", config.line)} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 -mt-0.5">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h4 className="text-sm font-medium text-[var(--color-text-primary)]">{item.title}</h4>
                <div className="flex items-center gap-2 shrink-0">
                  {item.amount !== undefined && (
                    <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                      ${(item.amount / 100).toLocaleString()}
                    </span>
                  )}
                  <Badge variant={config.badge} size="sm">{config.label}</Badge>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-0.5">{item.description}</p>
              )}
              {item.date && (
                <p className="text-[11px] text-[var(--color-text-muted)] mt-1">{item.date}</p>
              )}
              {item.actions && (
                <div className="mt-2">{item.actions}</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { Timeline }
export type { TimelineItem }
