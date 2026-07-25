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
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

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
      if (!intRes.ok) {
        setError(intData.error || "Failed to create payment intent")
      } else {
        setClientSecret(intData.clientSecret)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handlePay() {
    if (!clientSecret) return
    setPaying(true)
    const res = await fetch("/api/escrow/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id, clientSecret }),
    })
    if (res.ok) {
      router.push(`/projects/${id}`)
    } else {
      setError("Payment failed")
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="card-double"><div className="card-inner space-y-4"><div className="skeleton h-6 w-48" /><div className="skeleton h-3 w-64" /><div className="skeleton h-8 w-full" /></div></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to Project</Link>

      <div className="mt-6">
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner p-8 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Fund Escrow</h1>
              <p className="text-text-secondary text-sm mt-1">Deposit funds to start the project</p>
            </div>

            {project && (
              <div className="card-elevated rounded-xl p-4 space-y-3">
                <p className="font-semibold">{project.title}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total Budget</span>
                  <span className="font-semibold text-lg">${(project.totalAmount / 100).toLocaleString()}</span>
                </div>
                {project.milestones.length > 0 && (
                  <div className="border-t border-border-subtle pt-3">
                    <p className="text-xs text-text-muted mb-2">MILESTONES</p>
                    {project.milestones.map((m, i) => (
                      <div key={i} className="flex justify-between text-sm py-1">
                        <span className="text-text-secondary">{m.title}</span>
                        <span>${(m.amount / 100).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-4 bg-danger/10 rounded-xl text-sm text-danger text-center">{error}</div>
            )}

            {clientSecret && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full py-3 text-base"
              >
                {paying ? "Processing Payment..." : `Pay $${project ? (project.totalAmount / 100).toLocaleString() : ""}`}
              </button>
            )}

            <p className="text-xs text-text-muted text-center">Funds are held in escrow and released only when milestones are approved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
