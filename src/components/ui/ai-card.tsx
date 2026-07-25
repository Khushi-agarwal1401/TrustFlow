"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Sparkles, Bot, Brain, Loader2 } from "lucide-react"
import { Badge } from "./badge"

interface AICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  summary: string
  confidence?: "high" | "medium" | "low"
  loading?: boolean
  variant?: "default" | "compact" | "banner"
  icon?: "sparkles" | "bot" | "brain"
  onRefresh?: () => void
}

const iconMap = { sparkles: Sparkles, bot: Bot, brain: Brain }
const confidenceConfig = {
  high: { variant: "success" as const, label: "High Confidence" },
  medium: { variant: "warning" as const, label: "Needs Review" },
  low: { variant: "danger" as const, label: "Low Confidence" },
}

function AICard({ className, title = "AI Analysis", summary, confidence, loading, variant = "default", icon = "sparkles", onRefresh, ...props }: AICardProps) {
  const Icon = iconMap[icon]
  const conf = confidence ? confidenceConfig[confidence] : null

  const content = (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-accent-primary)]/10 flex items-center justify-center shrink-0">
        {loading ? (
          <Loader2 className="w-5 h-5 text-[var(--color-accent-primary)] animate-spin" />
        ) : (
          <Icon className="w-5 h-5 text-[var(--color-accent-primary)]" strokeWidth={1.5} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--color-accent-primary)]">{title}</span>
            {conf && <Badge variant={conf.variant} size="sm">{conf.label}</Badge>}
          </div>
          {onRefresh && !loading && (
            <button onClick={onRefresh} className="text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)] transition-colors">
              Refresh
            </button>
          )}
        </div>
        <p className={cn("text-sm leading-relaxed", loading ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-secondary)]")}>
          {loading ? "Analyzing..." : summary}
        </p>
      </div>
    </div>
  )

  if (variant === "compact") {
    return (
      <div className={cn("p-4 rounded-xl bg-gradient-to-br from-[var(--color-accent-subtle)] to-transparent border border-[var(--color-accent-primary)]/10", className)} {...props}>
        {content}
      </div>
    )
  }

  if (variant === "banner") {
    return (
      <div className={cn("relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[var(--color-accent-subtle)] via-[var(--color-accent-subtle)] to-transparent border border-[var(--color-accent-primary)]/10", className)} {...props}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--color-accent-primary)]/5 rounded-full blur-3xl pointer-events-none" />
        {content}
      </div>
    )
  }

  return (
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-accent-primary)]/15 shadow-sm", className)} {...props}>
      {content}
    </div>
  )
}

export { AICard }
