"use client"

import { useState, useEffect } from "react"
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
  milestone: { title: string; deliverableDescription: string }
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
        const d = disputes.find((d: DisputeData) => d.id === params.id)
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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#0B0A1F]"><p className="text-gray-500">Loading...</p></div>
  if (error || !dispute) return <div className="flex min-h-screen items-center justify-center bg-[#0B0A1F]"><p className="text-gray-300">{error || "Not found"}</p></div>

  return (
    <div className="min-h-screen bg-[#0B0A1F]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-white">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-poppins)" }}>Dispute</h1>
          <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-400">
            {dispute.status.replace(/_/g, " ")}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide" style={{ fontFamily: "var(--font-poppins)" }}>
                Milestone
              </h2>
              <p className="mt-2 text-lg font-semibold text-white" style={{ fontFamily: "var(--font-poppins)" }}>
                {dispute.milestone.title}
              </p>
              <p className="mt-1 text-sm text-gray-300">
                {dispute.milestone.deliverableDescription}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide" style={{ fontFamily: "var(--font-poppins)" }}>
                Evidence
              </h2>
              <div className="mt-4 space-y-4">
                {dispute.evidences.map((ev) => (
                  <div key={ev.id} className="rounded-lg border border-white/10 p-4">
                    <p className="text-xs text-gray-500">{ev.submitter.name}</p>
                    <p className="mt-1 text-sm text-white">{ev.statement}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <textarea
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Submit your evidence or statement..."
                />
                <button
                  onClick={handleSubmitEvidence}
                  disabled={submittingEvidence || !statement}
                  className="mt-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {submittingEvidence ? "Submitting..." : "Submit Evidence"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {dispute.status === "EVIDENCE_PENDING" && (
              <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-6">
                <p className="text-sm text-blue-400">
                  Evidence is being collected. Once both parties have submitted, request an AI suggested resolution.
                </p>
                <button
                  onClick={handleSuggest}
                  disabled={suggesting}
                  className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {suggesting ? "Analyzing..." : "Request AI Resolution"}
                </button>
              </div>
            )}

            {dispute.aiSuggestedResolution && (
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide" style={{ fontFamily: "var(--font-poppins)" }}>
                  AI Suggested Resolution
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white">
                  {dispute.aiSuggestedResolution.summary}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg bg-[#0B0A1F] px-3 py-2">
                    <p className="text-[10px] text-gray-500 uppercase">Cited Clause</p>
                    <p className="text-xs text-gray-300">{dispute.aiSuggestedResolution.citedClause}</p>
                  </div>
                  <div className="rounded-lg bg-[#0B0A1F] px-3 py-2">
                    <p className="text-[10px] text-gray-500 uppercase">Cited Evidence</p>
                    <p className="text-xs text-gray-300">{dispute.aiSuggestedResolution.citedEvidence}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-500">AI-generated suggestion — non-binding</p>

                {(dispute.status === "AI_SUGGESTED" || dispute.status === "EVIDENCE_PENDING") && (
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => handleResolve(true)}
                      className="rounded-lg bg-green-400 px-4 py-2 text-sm text-white"
                    >
                      Accept & Resolve
                    </button>
                    <button
                      onClick={() => handleResolve(false)}
                      className="rounded-lg border border-red-400/50 px-4 py-2 text-sm text-red-400"
                    >
                      Escalate to Admin
                    </button>
                  </div>
                )}
              </div>
            )}

            {dispute.status === "RESOLVED_ACCEPTED" && (
              <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-6 text-center">
                <p className="text-green-400 font-medium">Resolved</p>
              </div>
            )}

            {dispute.status === "ESCALATED" && (
              <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-6">
                <p className="text-sm text-yellow-400">
                  This dispute has been escalated for admin review.
                </p>
                {dispute.resolutionNotes && (
                  <p className="mt-2 text-xs text-gray-300">{dispute.resolutionNotes}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
