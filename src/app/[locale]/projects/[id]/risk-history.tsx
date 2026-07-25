"use client"

import { useState, useEffect } from "react"

interface RiskSignal {
  id: string
  level: string
  reason: string
  computedAt: string
}

interface RiskHistoryProps {
  projectId: string
}

export function RiskHistory({ projectId }: RiskHistoryProps) {
  const [signals, setSignals] = useState<RiskSignal[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/risk-signals`)
      .then((r) => r.json())
      .then((data) => {
        setSignals(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) return null
  if (signals.length === 0) return null

  const levelColor: Record<string, string> = {
    RED: "bg-danger/10 text-danger border-danger/20",
    AMBER: "bg-warning/10 text-warning border-warning/20",
    GREEN: "bg-success/10 text-success border-success/20",
  }

  const levelDot: Record<string, string> = {
    RED: "bg-danger",
    AMBER: "bg-warning",
    GREEN: "bg-success",
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-accent-primary hover:underline transition"
      >
        {expanded ? "Hide Risk History" : `Risk History (${signals.length})`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
          {signals.map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border p-3 ${levelColor[s.level] || "bg-bg-elevated text-text-secondary border-border-subtle"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${levelDot[s.level] || "bg-text-muted"}`} />
                  <span className="text-xs font-semibold uppercase">{s.level}</span>
                </div>
                <span className="text-[10px] opacity-60">{new Date(s.computedAt).toLocaleDateString()}</span>
              </div>
              {s.reason && <p className="text-xs leading-relaxed opacity-80">{s.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
