"use client"

import { useState } from "react"

interface DeadlinePredictProps {
  projectId: string
}

export function DeadlinePredict({ projectId }: DeadlinePredictProps) {
  const [result, setResult] = useState<{ estimatedDays: number; confidence: string; reasoning: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePredict() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/deadline-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Prediction failed")
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Prediction failed")
    } finally {
      setLoading(false)
    }
  }

  const confidenceColor = result?.confidence === "high" ? "bg-success/10 text-success"
    : result?.confidence === "medium" ? "bg-warning/10 text-warning"
    : "bg-text-muted/10 text-text-muted"

  return (
    <div>
      {!result ? (
        <button
          onClick={handlePredict}
          disabled={loading}
          className="text-xs text-accent-primary hover:underline transition disabled:opacity-50"
        >
          {loading ? "Predicting..." : "AI Predict Deadline"}
        </button>
      ) : (
        <div className="mt-2 p-3 rounded-xl bg-accent-subtle border border-accent-primary/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-primary">AI Deadline Estimate</span>
            <span className={`badge text-[10px] ${confidenceColor}`}>{result.confidence}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-accent-primary tabular-nums" style={{ fontFamily: "var(--font-poppins)" }}>{result.estimatedDays}</span>
            <span className="text-xs text-text-muted">days estimated</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{result.reasoning}</p>
        </div>
      )}
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  )
}
