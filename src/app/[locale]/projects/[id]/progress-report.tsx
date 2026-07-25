"use client"

import { useState } from "react"

interface MilestoneSnap {
  title: string
  status: string
}

interface ProgressReportProps {
  projectId: string
  projectTitle: string
  milestones: MilestoneSnap[]
}

interface ReportData {
  summary: string
  onTrack: boolean
  suggestions: string[]
}

export function ProgressReport({ projectId, projectTitle, milestones }: ProgressReportProps) {
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/progress-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, projectTitle, milestones }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Generation failed")
      setReport(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {!report ? (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="text-xs text-accent-primary hover:underline transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "AI Progress Report"}
        </button>
      ) : (
        <div className="mt-2 p-4 rounded-xl bg-accent-subtle border border-accent-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-primary">AI Progress Report</span>
            <span className={`badge text-[10px] ${report.onTrack ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
              {report.onTrack ? "On Track" : "Needs Attention"}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{report.summary}</p>
          {report.suggestions.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">Suggestions</p>
              <ul className="space-y-1">
                {report.suggestions.map((s, i) => (
                  <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-accent-primary mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={() => setReport(null)} className="text-[10px] text-text-muted hover:text-text-secondary transition">
            Dismiss
          </button>
        </div>
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}
