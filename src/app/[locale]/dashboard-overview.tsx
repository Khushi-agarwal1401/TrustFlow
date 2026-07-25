"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Shield, TrendingUp, Star, ChevronRight, Clock, Layers, FileCheck, CircleDashed, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardData {
  escrow: {
    protectedAmount: number
    totalFunded: number
    activeEscrowCount: number
    changePercent: number
  }
  aiTrustScore: {
    score: number
    rating: number | null
    completionRate: number
    disputeRate: number
  }
  currentPhase: {
    projectId: string
    projectTitle: string
    status: string
    phase: string
    nextMilestone: { id: string; title: string; status: string; sequence: number; amount: number } | null
    role: string
    counterpartyName: string | null
  } | null
  milestones: {
    total: number
    completed: number
    pending: number
    submitted: number
    disputed: number
    completionPercent: number
  }
  projects: {
    total: number
    active: number
    completed: number
    disputed: number
  }
}

function TrustScoreGauge({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? "var(--color-success)" : score >= 50 ? "var(--color-warning)" : "var(--color-danger)"
  const label = score >= 80 ? "Excellent" : score >= 50 ? "Needs Review" : "Critical"

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[88px] h-[88px] shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--color-bg-elevated)" strokeWidth="6" />
          <motion.circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg font-bold tabular-nums"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold">AI Trust Score</span>
          <Badge variant={score >= 80 ? "success" : score >= 50 ? "warning" : "danger"} size="sm">{label}</Badge>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Based on delivery rate, ratings & dispute history
        </p>
      </div>
    </div>
  )
}

function PhaseCard({ phase, onAction }: { phase: NonNullable<DashboardData["currentPhase"]>; onAction?: () => void }) {
  const phaseLabels: Record<string, { label: string; icon: typeof Clock; variant: "warning" | "info" | "accent" }> = {
    draft: { label: "Draft — Review & send to freelancer", icon: FileCheck, variant: "warning" },
    funding: { label: "Awaiting Funding — Fund escrow to start", icon: Clock, variant: "info" },
    in_progress: { label: `Working with ${phase.counterpartyName || "freelancer"}`, icon: Layers, variant: "accent" },
  }

  const config = phaseLabels[phase.phase] || { label: "In Progress", icon: Layers, variant: "accent" as const }
  const Icon = config.icon

  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-subtle)] to-transparent border border-[var(--color-accent-primary)]/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[var(--color-accent-primary)]" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Current Phase</span>
          <Badge variant="primary" size="sm">{phase.role === "client" ? "Client" : "Freelancer"}</Badge>
        </div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{config.label}</p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 truncate">{phase.projectTitle}</p>
        {phase.nextMilestone && (
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--color-text-muted)]">
            <CircleDashed className="w-3 h-3" />
            <span>Next: {phase.nextMilestone.title}</span>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Link href={`/projects/${phase.projectId}`}>
            <Button size="sm" variant="primary">
              {phase.phase === "draft" ? "Review & Send" : phase.phase === "funding" ? "Fund Escrow" : "View Project"}
              <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard/overview")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 space-y-4 animate-pulse">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  )

  if (!data) return null

  const { escrow, aiTrustScore, currentPhase, milestones, projects } = data

  const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 })
  const usdFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      {/* Row 1: Escrow + Trust Score + Current Phase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Escrow Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-success-subtle)] to-transparent border border-[var(--color-success)]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--color-success)]" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--color-success)] font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {escrow.changePercent > 0 ? "+" : ""}{escrow.changePercent}%
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Escrow Protected</p>
          <p className="text-3xl font-bold tracking-tight tabular-nums">{usdFormatter.format(escrow.protectedAmount / 100)}</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Across <span className="font-semibold text-[var(--color-text-primary)]">{escrow.activeEscrowCount}</span> active {escrow.activeEscrowCount === 1 ? "project" : "projects"}
          </p>
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
              <span>Total Funded</span>
              <span className="font-medium text-[var(--color-text-primary)]">{usdFormatter.format(escrow.totalFunded / 100)}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Trust Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--color-warning-subtle)] to-transparent border border-[var(--color-warning)]/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-[var(--color-warning)]" strokeWidth={1.5} />
            </div>
          </div>
          <TrustScoreGauge score={aiTrustScore.score} />
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Avg Rating</p>
              <p className="text-sm font-semibold mt-0.5">{aiTrustScore.rating ? `${aiTrustScore.rating.toFixed(1)} / 5` : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-medium">Completion</p>
              <p className="text-sm font-semibold mt-0.5">{aiTrustScore.completionRate}%</p>
            </div>
          </div>
        </motion.div>

        {/* Current Phase Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
        >
          {currentPhase ? (
            <PhaseCard phase={currentPhase} />
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-bg-elevated)] flex items-center justify-center mb-3">
                <Layers className="w-5 h-5 text-[var(--color-text-muted)]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">No active project</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-4">Start by creating a new project or accepting an invite</p>
              <Link href="/projects/new">
                <Button size="sm">
                  Create Project
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Row 2: Milestone Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-info-subtle)] to-transparent border border-[var(--color-info)]/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-[var(--color-info)]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Milestone Progress</h3>
              <p className="text-xs text-[var(--color-text-muted)]">
                {milestones.total} total · {milestones.completed} completed · {milestones.pending} pending
              </p>
            </div>
          </div>
          {milestones.total > 0 && (
            <span className="text-lg font-bold tabular-nums text-[var(--color-accent-primary)]">{milestones.completionPercent}%</span>
          )}
        </div>

        {milestones.total > 0 ? (
          <div className="space-y-4">
            <Progress value={milestones.completionPercent} variant="accent" size="lg" showValue />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[var(--color-success-subtle)]">
                <p className="text-lg font-bold text-[var(--color-success)] tabular-nums">{milestones.completed}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">Completed</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-warning-subtle)]">
                <p className="text-lg font-bold text-[var(--color-warning)] tabular-nums">{milestones.submitted}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">Submitted</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-info-subtle)]">
                <p className="text-lg font-bold text-[var(--color-info)] tabular-nums">{milestones.pending}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">Pending</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-danger-subtle)]">
                <p className="text-lg font-bold text-[var(--color-danger)] tabular-nums">{milestones.disputed}</p>
                <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">Disputed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-bg-elevated)] flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6 text-[var(--color-text-muted)]" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No milestones yet</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Create a project with milestones to track progress</p>
          </div>
        )}
      </motion.div>

      {/* Row 3: Quick Project Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[var(--color-border-subtle)] rounded-2xl overflow-hidden border border-[var(--color-border-subtle)]">
        {[
          { label: "Total Projects", value: projects.total, color: "text-[var(--color-text-primary)]" },
          { label: "Active", value: projects.active, color: "text-[var(--color-accent-primary)]" },
          { label: "Completed", value: projects.completed, color: "text-[var(--color-success)]" },
          { label: "Disputed", value: projects.disputed, color: "text-[var(--color-danger)]" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--color-bg-surface)] p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold tracking-tight tabular-nums ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
