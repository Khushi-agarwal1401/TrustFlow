"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

export default function NewProjectPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [projectId, setProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, totalAmount: parseFloat(totalAmount) }),
    })
    const data = await res.json()
    if (res.ok) {
      setProjectId(data.id)
      setStep(2)
    }
    setLoading(false)
  }

  async function handleGenerateContract() {
    if (!projectId) return
    setLoading(true)
    await fetch("/api/contracts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
    setLoading(false)
    router.push(`/projects/${projectId}/contract`)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>New Project</h1>
        </div>
        <span className="badge bg-accent-subtle text-accent-primary">Step {step} of 2</span>
      </header>

      {step === 1 && (
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner space-y-5">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Project Title</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Build a landing page" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Description</label>
              <textarea className="input min-h-[100px] resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your project scope, deliverables, and timeline..." />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">Budget (USD)</label>
              <input className="input" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g., 5000" />
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/" className="btn-ghost">Cancel</Link>
              <button onClick={handleCreate} disabled={loading || !title || !totalAmount} className="btn-primary">
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner space-y-5">
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Project Created!</h2>
              <p className="text-text-secondary text-sm mt-1">Your project has been created. Now generate an AI-powered contract.</p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href={`/projects/${projectId}`} className="btn-ghost">Skip for now</Link>
              <button onClick={handleGenerateContract} disabled={loading} className="btn-primary">
                {loading ? "Generating..." : "Generate Contract"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-2">
        <div className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-accent-primary" : "bg-border-subtle"}`} />
        <div className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-accent-primary" : "bg-border-subtle"}`} />
      </div>
    </div>
  )
}
