"use client"

import { useState, useEffect, use } from "react"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ProjectProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()

  const [project, setProject] = useState<{ id: string; title: string; clientId: string; totalAmount: number; isListed: boolean } | null>(null)
  const [proposals, setProposals] = useState<{ id: string; coverLetter: string; bidAmount: number; status: string; createdAt: string; freelancer: { id: string; name: string } }[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [bidAmount, setBidAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/projects/${id}`).then((r) => r.json()),
      fetch(`/api/proposals?projectId=${id}`).then((r) => r.json()),
    ]).then(([proj, props]) => {
      setProject(proj)
      setProposals(props)
      setLoading(false)
    })
  }, [id])

  async function handleSubmitProposal() {
    if (!coverLetter || !bidAmount) return
    setSubmitting(true)
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, coverLetter, bidAmount: parseFloat(bidAmount) }),
    })
    if (res.ok) {
      setShowForm(false)
      setCoverLetter("")
      setBidAmount("")
      const refreshed = await fetch(`/api/proposals?projectId=${id}`).then((r) => r.json())
      setProposals(refreshed)
    }
    setSubmitting(false)
  }

  async function handleAccept(proposalId: string) {
    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    })
    if (res.ok) {
      const refreshed = await fetch(`/api/proposals?projectId=${id}`).then((r) => r.json())
      setProposals(refreshed)
    }
  }

  async function handleReject(proposalId: string) {
    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject" }),
    })
    if (res.ok) {
      const refreshed = await fetch(`/api/proposals?projectId=${id}`).then((r) => r.json())
      setProposals(refreshed)
    }
  }

  async function handleWithdraw(proposalId: string) {
    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "withdraw" }),
    })
    if (res.ok) {
      const refreshed = await fetch(`/api/proposals?projectId=${id}`).then((r) => r.json())
      setProposals(refreshed)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="card-double"><div className="card-inner space-y-4"><div className="skeleton h-6 w-48" /><div className="skeleton h-24 w-full" /></div></div>
    </div>
  )

  if (!project) return <div className="p-6 text-text-muted">Project not found</div>

  const isClient = session?.user?.id === project.clientId
  const canPropose = !isClient && project.isListed

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to Project</Link>

      <div className="mt-6 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Proposals</h1>
          <p className="text-text-secondary text-sm mt-0.5">for {project.title}</p>
        </div>
        {canPropose && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            {showForm ? "Cancel" : "Submit Proposal"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card-double mb-6 animate-fade-up">
          <div className="card-inner space-y-4">
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Submit Your Proposal</h3>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Cover Letter</label>
              <textarea className="input min-h-[120px] resize-y" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Why are you the right fit for this project?" />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Bid Amount (USD)</label>
              <input className="input" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Your bid" />
            </div>
            <button onClick={handleSubmitProposal} disabled={submitting || !coverLetter || !bidAmount} className="btn-primary">
              {submitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 animate-fade-up stagger-2">
        {proposals.length === 0 ? (
          <div className="card-double"><div className="card-inner text-center py-12">
            <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-text-muted">{isClient ? "No proposals yet" : "No proposals submitted yet"}</p>
            {canPropose && <p className="text-text-muted text-sm mt-1">Submit your proposal above</p>}
          </div></div>
        ) : (
          proposals.map((p, i) => {
            const isMine = session?.user?.id === p.freelancer.id
            return (
              <div key={p.id} className={`card-double animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                <div className="card-inner">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary font-semibold text-sm">
                        {p.freelancer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.freelancer.name}</p>
                        <p className="text-xs text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ fontFamily: "var(--font-poppins)" }}>${(p.bidAmount / 100).toLocaleString()}</p>
                      <span className={`badge ${
                        p.status === "ACCEPTED" ? "bg-success/10 text-success" :
                        p.status === "REJECTED" ? "bg-danger/10 text-danger" :
                        p.status === "WITHDRAWN" ? "bg-text-muted/10 text-text-muted" :
                        "bg-warning/10 text-warning"
                      }`}>{p.status.toLowerCase()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.coverLetter}</p>
                  {isClient && p.status === "PENDING" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border-subtle">
                      <button onClick={() => handleAccept(p.id)} className="btn-primary text-xs">Accept</button>
                      <button onClick={() => handleReject(p.id)} className="btn-ghost text-xs">Reject</button>
                    </div>
                  )}
                  {isMine && p.status === "PENDING" && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <button onClick={() => handleWithdraw(p.id)} className="text-danger text-xs hover:underline">Withdraw</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
