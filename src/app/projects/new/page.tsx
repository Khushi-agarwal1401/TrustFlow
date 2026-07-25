"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewProjectPage() {
  const router = useRouter()
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
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Back to dashboard</Link>

      <h1 className="text-2xl font-bold mt-6 mb-8" style={{ fontFamily: "var(--font-poppins)" }}>
        {step === 1 ? "Create Project" : "Generate Contract"}
      </h1>

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Project Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., E-commerce Website" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
            <textarea className="input min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scope, deliverables, and timeline..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Budget (USD)</label>
            <input className="input" type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="5000" min="0" step="0.01" />
          </div>
          <button onClick={handleCreate} disabled={loading || !title || !description || !totalAmount} className="btn-primary w-full">
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      ) : (
        <div className="text-center p-8 card">
          <h2 className="text-xl font-semibold mb-2">Project Created!</h2>
          <p className="text-text-secondary mb-6">Now generate an AI-powered contract with milestones.</p>
          <button onClick={handleGenerateContract} disabled={loading} className="btn-primary">
            {loading ? "Generating..." : "Generate Contract with AI"}
          </button>
        </div>
      )}
    </div>
  )
}
