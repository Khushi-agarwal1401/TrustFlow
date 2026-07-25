"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function FundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<{ title: string; totalAmount: number; milestones: { title: string; amount: number }[] } | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const projRes = await fetch(`/api/projects/${id}`)
      const projData = await projRes.json()
      setProject(projData)

      const intRes = await fetch("/api/escrow/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id }),
      })
      const intData = await intRes.json()
      setClientSecret(intData.clientSecret)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleConfirm() {
    if (!clientSecret) return
    setLoading(true)

    await fetch("/api/escrow/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, paymentIntentId: clientSecret }),
    })

    router.push(`/projects/${id}`)
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>
  if (!project) return <div className="p-6 text-text-muted">Project not found</div>

  return (
    <div className="max-w-xl mx-auto p-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary">&larr; Back to project</Link>

      <h1 className="text-2xl font-bold mt-4 mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Fund Escrow</h1>
      <p className="text-text-secondary mb-6">Deposit funds for <strong>{project.title}</strong></p>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Milestone Breakdown</h3>
        <div className="space-y-2">
          {project.milestones.map((m, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{m.title}</span>
              <span className="font-medium">${(m.amount / 100).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold pt-2 border-t border-border-subtle">
            <span>Total</span>
            <span>${(project.totalAmount / 100).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-4">
        <h3 className="font-semibold mb-4 text-center">Payment Method</h3>
        <div id="card-element" className="p-3 bg-bg-elevated rounded-lg mb-4" />
        <button onClick={handleConfirm} disabled={loading} className="btn-primary w-full">
          {loading ? "Processing..." : `Pay $${(project.totalAmount / 100).toLocaleString()}`}
        </button>
      </div>

      <p className="text-xs text-text-muted text-center">
        Funds are held in escrow and released upon milestone approval
      </p>
    </div>
  )
}
