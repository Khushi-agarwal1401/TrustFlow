"use client"

import { GlassCard } from "./GlassCard"
import { CheckCircle2, Circle, Sparkles, Activity } from "lucide-react"

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/20 blur-[100px] rounded-full -z-10 animate-pulse duration-3000" />
      <div className="absolute top-1/4 right-1/4 w-[60%] h-[60%] bg-brand-secondary/20 blur-[80px] rounded-full -z-10 animate-pulse duration-4000" />

      {/* Main Dashboard Window */}
      <GlassCard className="p-6 md:p-8 shadow-[0_12px_48px_rgba(0,0,0,0.5)] border-[rgba(255,255,255,0.1)]">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[rgba(255,255,255,0.06)] pb-6 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-wider text-brand-text-muted uppercase mb-1">
              Project
            </p>
            <h2 className="text-2xl font-poppins font-bold text-white">
              Website Redesign
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold tracking-wider text-brand-text-muted uppercase mb-1">
              Total Budget
            </p>
            <p className="text-xl font-bold text-white tabular-nums">
              ₹1,20,000
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Progress Flow */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-brand-text-muted uppercase tracking-wider mb-4">
                Milestone Progress
              </h3>
              <div className="flex flex-col gap-3">
                <MilestoneCard
                  title="Milestone 1: Brand & UX"
                  amount="₹30,000"
                  status="Approved"
                  completed
                />
                <MilestoneCard
                  title="Milestone 2: Frontend Development"
                  amount="₹45,000"
                  status="AI Review: High confidence"
                  active
                />
                <MilestoneCard
                  title="Milestone 3: Deployment"
                  amount="₹45,000"
                  status="Awaiting submission"
                />
              </div>
            </div>
          </div>

          {/* AI Summary Sidebar */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <GlassCard glow="cyan" className="p-5 border-brand-cyan/20 bg-brand-surface/80">
              <div className="flex items-center gap-2 text-brand-cyan mb-3">
                <Sparkles size={16} />
                <h4 className="text-sm font-semibold uppercase tracking-wider">
                  AI Summary
                </h4>
              </div>
              <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
                Submission appears aligned with the defined milestone deliverable.
              </p>
              <div className="bg-[rgba(103,232,249,0.1)] rounded-lg p-3 flex justify-between items-center mb-3 border border-[rgba(103,232,249,0.2)]">
                <span className="text-xs text-brand-text-muted font-semibold uppercase">
                  Confidence
                </span>
                <span className="text-xs font-bold text-brand-cyan">HIGH</span>
              </div>
              <p className="text-[10px] text-brand-text-muted italic">
                AI-generated — review before relying on it.
              </p>
            </GlassCard>

            {/* Risk Indicator */}
            <GlassCard glow="none" className="p-5">
              <div className="flex items-center gap-2 text-brand-success mb-2">
                <Activity size={16} />
                <h4 className="text-sm font-semibold text-brand-text">
                  Project Risk
                </h4>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-success shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-bold text-brand-success">
                  GREEN
                </span>
              </div>
              <p className="text-xs text-brand-text-muted">
                Activity detected 1 day ago. Deadline in 5 days.
              </p>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}

function MilestoneCard({
  title,
  amount,
  status,
  completed = false,
  active = false,
}: {
  title: string
  amount: string
  status: string
  completed?: boolean
  active?: boolean
}) {
  return (
    <div
      className={`p-4 rounded-xl border flex items-start gap-4 transition-colors ${
        active
          ? "bg-[rgba(139,92,246,0.1)] border-brand-primary/30"
          : "bg-brand-surface/40 border-[rgba(255,255,255,0.06)]"
      }`}
    >
      <div className="mt-0.5">
        {completed ? (
          <CheckCircle2 size={18} className="text-brand-success" />
        ) : active ? (
          <div className="relative">
            <Circle size={18} className="text-brand-primary" />
            <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-ping" />
          </div>
        ) : (
          <Circle size={18} className="text-brand-text-muted" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4
            className={`text-sm font-semibold ${
              completed || active ? "text-white" : "text-brand-text-secondary"
            }`}
          >
            {title}
          </h4>
          <span className="text-sm font-bold text-white tabular-nums">
            {amount}
          </span>
        </div>
        <p className="text-xs text-brand-text-muted flex items-center gap-1.5">
          {completed && (
            <CheckCircle2 size={12} className="text-brand-success" />
          )}
          {status}
        </p>
      </div>
    </div>
  )
}
