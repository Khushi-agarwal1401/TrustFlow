"use client"

import { useState, useEffect, use } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface EvidenceItem {
  id: string
  submittedBy: string
  statement: string
  fileUrls: string[]
  createdAt: string
  submitter: { id: string; name: string }
}

interface DisputeData {
  id: string
  status: string
  openedBy: string
  aiSuggestedResolution: { summary: string; citedClause: string; citedEvidence: string } | null
  createdAt: string
  resolvedAt: string | null
  resolutionNotes: string | null
  milestone: { title: string; deliverable_description: string }
  evidences: EvidenceItem[]
}

export default function DisputePage() {
  const params = useParams()
  const [dispute, setDispute] = useState<DisputeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statement, setStatement] = useState("")
  const [submittingEvidence, setSubmittingEvidence] = useState(false)
  const [suggesting, setSuggesting] = useState(false)

  useEffect(() => {
    fetch("/api/disputes")
      .then((r) => r.json())
      .then((disputes) => {
        const d = disputes.find((d: any) => d.id === params.id)
        if (d) setDispute(d)
        else setError("Dispute not found")
      })
      .catch(() => setError("Failed to load dispute"))
      .finally(() => setLoading(false))
  }, [params.id])

  async function handleSubmitEvidence() {
    if (!statement) return
    setSubmittingEvidence(true)
    try {
      const res = await fetch(`/api/disputes/${params.id}/evidence`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statement }),
      })
      if (!res.ok) throw new Error("Failed to submit evidence")
      setStatement("")
      const newEvidence = await res.json()
      setDispute((prev) =>
        prev ? { ...prev, evidences: [...prev.evidences, newEvidence] } : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setSubmittingEvidence(false)
    }
  }

  async function handleSuggest() {
    setSuggesting(true)
    try {
      const res = await fetch(`/api/disputes/${params.id}/suggest`, { method: "POST" })
      if (!res.ok) throw new Error("AI suggestion failed")
      const data = await res.json()
      setDispute((prev) =>
        prev
          ? {
              ...prev,
              aiSuggestedResolution: data.resolution,
              status: "AI_SUGGESTED",
            }
          : prev
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI suggestion failed")
    } finally {
      setSuggesting(false)
    }
  }

  async function handleResolve(accept: boolean) {
    try {
      const res = await fetch(`/api/disputes/${params.id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accept }),
      })
      if (!res.ok) throw new Error("Resolution failed")
      const data = await res.json()
      setDispute(data.dispute)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution failed")
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg-canvas"><p className="text-text-muted">Loading...</p></div>
  if (error || !dispute) return <div className="flex min-h-screen items-center justify-center bg-bg-canvas"><p className="text-text-secondary">{error || "Not found"}</p></div>

  return (
    <div className="min-h-screen bg-bg-canvas">
      <header className="border-b border-border-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">&larr; Dashboard</Link>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Dispute</h1>
          <span className="rounded-pill border border-state-danger/30 bg-state-danger/10 px-3 py-1 text-xs text-state-danger">
            {dispute.status.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-card border border-border-surface bg-bg-surface p-6">
              <h2 className="font-heading text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Milestone
              </h2>
              <p className="mt-2 font-heading text-lg font-semibold text-text-primary">
                {dispute.milestone.title}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {dispute.milestone.deliverable_description}
              </p>
            </div>

            <div className="rounded-card border border-border-surface bg-bg-surface p-6">
              <h2 className="font-heading text-sm font-semibold text-text-secondary uppercase tracking-wide">
                Evidence
              </h2>
              <div className="mt-4 space-y-4">
                {dispute.evidences.map((ev) => (
                  <div key={ev.id} className="rounded-button border border-border-surface p-4">
                    <p className="text-xs text-text-muted">{ev.submitter.name}</p>
                    <p className="mt-1 text-sm text-text-primary">{ev.statement}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  className="w-full rounded-button border border-border-surface bg-transparent px-4 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="Submit your evidence or statement..."
                />
                <button
                  onClick={handleSubmitEvidence}
                  disabled={submittingEvidence || !statement}
                  className="mt-2 rounded-button bg-accent-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {submittingEvidence ? "Submitting..." : "Submit Evidence"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {dispute.status === "EVIDENCE_PENDING" && (
              <div className="rounded-card border border-accent-info/20 bg-accent-info/5 p-6">
                <p className="text-sm text-accent-info">
                  Evidence is being collected. Once both parties have submitted, request an AI suggested resolution.
                </p>
                <button
                  onClick={handleSuggest}
                  disabled={suggesting}
                  className="mt-4 rounded-button bg-accent-primary px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {suggesting ? "Analyzing..." : "Request AI Resolution"}
                </button>
              </div>
            )}

            {dispute.aiSuggestedResolution && (
              <div className="rounded-card border border-accent-primary/20 bg-accent-primary/5 p-6">
                <h3 className="font-heading text-sm font-semibold text-accent-primary uppercase tracking-wide">
                  AI Suggested Resolution
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-primary">
                  {dispute.aiSuggestedResolution.summary}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-button bg-bg-canvas px-3 py-2">
                    <p className="text-[10px] text-text-muted uppercase">Cited Clause</p>
                    <p className="text-xs text-text-secondary">{dispute.aiSuggestedResolution.citedClause}</p>
                  </div>
                  <div className="rounded-button bg-bg-canvas px-3 py-2">
                    <p className="text-[10px] text-text-muted uppercase">Cited Evidence</p>
                    <p className="text-xs text-text-secondary">{dispute.aiSuggestedResolution.citedEvidence}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-text-muted">AI-generated suggestion — non-binding</p>

                {(dispute.status === "AI_SUGGESTED" || dispute.status === "EVIDENCE_PENDING") && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleResolve(true)}
                      className="rounded-button bg-state-success px-4 py-2 text-sm text-white"
                    >
                      Accept & Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(false)}
                      className="rounded-button border border-state-danger/50 px-4 py-2 text-sm text-state-danger"
                    >
                      Escalate to Admin
                    </button>
                  </div>
                )}
              </div>
            )}

            {dispute.status === "RESOLVED_ACCEPTED" && (
              <div className="rounded-card border border-state-success/20 bg-state-success/5 p-6 text-center">
                <p className="text-state-success font-medium">Resolved</p>
              </div>
            )}

            {dispute.status === "ESCALATED" && (
              <div className="rounded-card border border-state-warning/20 bg-state-warning/5 p-6">
                <p className="text-sm text-state-warning">
                  This dispute has been escalated for admin review.
                </p>
                {dispute.resolutionNotes && (
                  <p className="mt-2 text-xs text-text-secondary">{dispute.resolutionNotes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
