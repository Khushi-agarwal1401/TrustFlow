"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function ProjectProposalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
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

  async function handleSubmitProposal(e: React.FormEvent) {
    e.preventDefault()
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
      const props = await fetch(`/api/proposals?projectId=${id}`).then((r) => r.json())
      setProposals(props)
    }
    setSubmitting(false)
  }

  async function handleAction(proposalId: string, action: string) {
    await fetch(`/api/proposals/${proposalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    router.refresh()
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>
  if (!project) return <div className="p-6 text-text-muted">Project not found</div>

  const isClient = project.clientId === session?.user?.id
  const isFreelancer = !isClient && session?.user?.id

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary">&larr; Back to project</Link>
      <h1 className="text-2xl font-bold mt-4 mb-2" style={{ fontFamily: "var(--font-poppins)" }}>{project.title}</h1>
      <p className="text-text-secondary text-sm mb-6">${(project.totalAmount / 100).toLocaleString()} · {proposals.length} proposals</p>

      {isFreelancer && !showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary mb-6">Submit Proposal</button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitProposal} className="card p-4 mb-6 space-y-3">
          <h3 className="font-semibold">New Proposal</h3>
          <textarea className="input min-h-[120px]" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Cover letter..." required />
          <input className="input" type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Bid amount (USD)" min="0" step="0.01" required />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? "Submitting..." : "Submit"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {proposals.length === 0 ? (
          <p className="text-text-muted text-sm">No proposals yet</p>
        ) : (
          proposals.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${p.freelancer.id}`} className="font-semibold text-sm hover:text-accent-primary">{p.freelancer.name}</Link>
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted">{p.status.toLowerCase()}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">{p.coverLetter}</p>
                  <p className="text-xs text-text-muted mt-1">Bid: <span className="text-accent-primary font-medium">${(p.bidAmount / 100).toLocaleString()}</span> · {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                {isClient && p.status === "PENDING" && (
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleAction(p.id, "ACCEPT")} className="text-success text-sm font-medium">Accept</button>
                    <button onClick={() => handleAction(p.id, "REJECT")} className="text-danger text-sm">Reject</button>
                  </div>
                )}
                {p.freelancer.id === session?.user?.id && p.status === "PENDING" && (
                  <button onClick={() => handleAction(p.id, "WITHDRAW")} className="text-danger text-sm ml-4">Withdraw</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
