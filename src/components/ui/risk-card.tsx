"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ShieldAlert, AlertTriangle, CheckCircle, TrendingUp, ArrowUpRight } from "lucide-react"
import { Badge } from "./badge"

interface RiskItem {
  level: "green" | "amber" | "red"
  reason: string
  date: string
}

interface RiskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  currentLevel: "green" | "amber" | "red"
  currentReason?: string
  history?: RiskItem[]
  trend?: "improving" | "stable" | "worsening"
  compact?: boolean
  onViewHistory?: () => void
}

const levelConfig = {
  green: { icon: CheckCircle, badge: "success" as const, label: "Low Risk", gradient: "from-[var(--color-success-subtle)] to-transparent", border: "border-[var(--color-success)]/15" },
  amber: { icon: AlertTriangle, badge: "warning" as const, label: "Medium Risk", gradient: "from-[var(--color-warning-subtle)] to-transparent", border: "border-[var(--color-warning)]/15" },
  red: { icon: ShieldAlert, badge: "danger" as const, label: "High Risk", gradient: "from-[var(--color-danger-subtle)] to-transparent", border: "border-[var(--color-danger)]/15" },
}

const trendConfig = {
  improving: { icon: CheckCircle, color: "text-[var(--color-success)]", label: "Improving" },
  stable: { icon: TrendingUp, color: "text-[var(--color-text-muted)]", label: "Stable" },
  worsening: { icon: ArrowUpRight, color: "text-[var(--color-danger)]", label: "Worsening" },
}

function RiskCard({ className, currentLevel, currentReason, history, trend, compact, onViewHistory, ...props }: RiskCardProps) {
  const config = levelConfig[currentLevel]
  const Icon = config.icon
  const trendData = trend ? trendConfig[trend] : null

  const content = (
    <div className="flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", {
        "bg-[var(--color-success-subtle)] text-[var(--color-success)]": currentLevel === "green",
        "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]": currentLevel === "amber",
        "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]": currentLevel === "red",
      })}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold", {
              "text-[var(--color-success)]": currentLevel === "green",
              "text-[var(--color-warning)]": currentLevel === "amber",
              "text-[var(--color-danger)]": currentLevel === "red",
            })}>{config.label}</span>
            {trendData && (
              <span className={cn("text-[10px] flex items-center gap-0.5", trendData.color)}>
                <trendData.icon className="w-3 h-3" strokeWidth={2.5} />
                {trendData.label}
              </span>
            )}
          </div>
          <Badge variant={(currentLevel === "red" ? "danger" : currentLevel === "amber" ? "warning" : "success") as "danger" | "warning" | "success"}>
            {currentLevel.toUpperCase()}
          </Badge>
        </div>
        {currentReason && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{currentReason}</p>
        )}
        {onViewHistory && (
          <button onClick={onViewHistory} className="text-[11px] text-[var(--color-accent-primary)] hover:underline mt-1.5 font-medium">
            View risk history →
          </button>
        )}
      </div>
    </div>
  )

  if (compact) {
    return (
      <div className={cn("p-3 rounded-xl bg-gradient-to-br border", config.gradient, config.border, className)} {...props}>
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full shrink-0", {
            "bg-[var(--color-success)]": currentLevel === "green",
            "bg-[var(--color-warning)]": currentLevel === "amber",
            "bg-[var(--color-danger)]": currentLevel === "red",
          })} />
          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{currentReason || config.label}</p>
          <Badge variant={(currentLevel === "red" ? "danger" : currentLevel === "amber" ? "warning" : "success") as "danger" | "warning" | "success"} size="sm">
            {currentLevel}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-surface)] border shadow-sm bg-gradient-to-br", config.gradient, config.border, className)} {...props}>
      {content}
    </div>
  )
}

export { RiskCard }
export type { RiskItem }
