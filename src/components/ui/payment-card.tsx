"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Wallet, CreditCard, Lock, ArrowUpRight, CheckCircle, Clock, DollarSign } from "lucide-react"
import { Badge } from "./badge"

interface PaymentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number
  currency?: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  title?: string
  description?: string
  from?: string
  to?: string
  date?: string
  variant?: "default" | "compact" | "minimal"
  onAction?: () => void
  actionLabel?: string
  escrow?: boolean
}

const statusConfig = {
  pending: { badge: "warning" as const, icon: Clock, label: "Pending" },
  processing: { badge: "info" as const, icon: Wallet, label: "Processing" },
  completed: { badge: "success" as const, icon: CheckCircle, label: "Completed" },
  failed: { badge: "danger" as const, icon: CreditCard, label: "Failed" },
  refunded: { badge: "default" as const, icon: DollarSign, label: "Refunded" },
}

function PaymentCard({ className, amount, currency = "USD", status, title = "Payment", description, from, to, date, variant = "default", onAction, actionLabel, escrow = false, ...props }: PaymentCardProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  const formatted = new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(amount / 100)

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-between p-3", className)} {...props}>
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", {
            "bg-[var(--color-success-subtle)] text-[var(--color-success)]": status === "completed",
            "bg-[var(--color-warning-subtle)] text-[var(--color-warning)]": status === "pending",
            "bg-[var(--color-info-subtle)] text-[var(--color-info)]": status === "processing",
            "bg-[var(--color-danger-subtle)] text-[var(--color-danger)]": status === "failed",
            "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]": status === "refunded",
          })}>
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{date || config.label}</p>
          </div>
        </div>
        <span className="text-sm font-semibold tabular-nums">{formatted}</span>
      </div>
    )
  }

  return (
    <div className={cn("p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-sm", className)} {...props}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", {
            "bg-gradient-to-br from-[var(--color-success-subtle)] to-transparent": status === "completed",
            "bg-gradient-to-br from-[var(--color-warning-subtle)] to-transparent": status === "pending",
            "bg-gradient-to-br from-[var(--color-info-subtle)] to-transparent": status === "processing",
            "bg-gradient-to-br from-[var(--color-danger-subtle)] to-transparent": status === "failed",
            "bg-[var(--color-bg-elevated)]": status === "refunded",
          })}>
            {escrow ? (
              <Lock className={cn("w-6 h-6", {
                "text-[var(--color-success)]": status === "completed",
                "text-[var(--color-warning)]": status === "pending",
                "text-[var(--color-info)]": status === "processing",
                "text-[var(--color-danger)]": status === "failed",
              })} strokeWidth={1.5} />
            ) : (
              <Icon className={cn("w-6 h-6", {
                "text-[var(--color-success)]": status === "completed",
                "text-[var(--color-warning)]": status === "pending",
                "text-[var(--color-info)]": status === "processing",
                "text-[var(--color-danger)]": status === "failed",
              })} strokeWidth={1.5} />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{formatted}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={config.badge} size="sm">{config.label}</Badge>
              {escrow && <span className="text-[10px] text-[var(--color-text-muted)]">Held in escrow</span>}
            </div>
          </div>
        </div>
      </div>

      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-3 leading-relaxed">{description}</p>
      )}

      {(from || to) && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-3">
          {from && <span>From: <span className="font-medium text-[var(--color-text-secondary)]">{from}</span></span>}
          {from && to && <ArrowUpRight className="w-3 h-3" />}
          {to && <span>To: <span className="font-medium text-[var(--color-text-secondary)]">{to}</span></span>}
        </div>
      )}

      {onAction && actionLabel && status === "pending" && (
        <button onClick={onAction} className="btn-primary w-full mt-2">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export { PaymentCard }
