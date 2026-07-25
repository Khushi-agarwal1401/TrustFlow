"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Milestone {
  id?: string
  title: string
  deliverableDescription: string
  amount: number
  sequence: number
  dueDate?: string
}

export default function ContractPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [terms, setTerms] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.milestones) {
          setMilestones(data.milestones.map((m: Milestone) => ({ ...m })))
        }
        if (data.contract?.aiGeneratedDraft?.terms) setTerms(data.contract.aiGeneratedDraft.terms)
        setLoading(false)
      })
  }, [id])

  const total = milestones.reduce((sum, m) => sum + m.amount, 0)

  function updateMilestone(index: number, field: keyof Milestone, value: string | number) {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      { title: "", deliverableDescription: "", amount: 0, sequence: prev.length },
    ])
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setLoading(true)
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones, terms }),
    })
    router.push(`/projects/${id}`)
  }

  if (loading) return <div className="p-6 text-text-muted">Loading contract...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary">&larr; Back to project</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Edit Contract</h1>

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={index} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Milestone {index + 1}</h3>
              {milestones.length > 1 && (
                <button onClick={() => removeMilestone(index)} className="text-danger text-sm">Remove</button>
              )}
            </div>
            <input className="input" value={milestone.title} onChange={(e) => updateMilestone(index, "title", e.target.value)} placeholder="Title" />
            <textarea className="input min-h-[60px]" value={milestone.deliverableDescription} onChange={(e) => updateMilestone(index, "deliverableDescription", e.target.value)} placeholder="Description" />
            <input className="input" type="number" value={milestone.amount / 100} onChange={(e) => updateMilestone(index, "amount", Math.round(parseFloat(e.target.value) * 100))} placeholder="Amount (USD)" min="0" step="0.01" />
          </div>
        ))}

        <button onClick={addMilestone} className="btn-ghost w-full">+ Add Milestone</button>

        <div className="sticky bottom-0 bg-bg-base p-4 -mx-6 border-t border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold">Total</span>
            <span className={`text-xl font-bold ${total > 0 ? "text-accent-primary" : "text-text-muted"}`}>
              ${(total / 100).toLocaleString()}
            </span>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
            {loading ? "Saving..." : "Save Contract"}
          </button>
        </div>
      </div>
    </div>
  )
}
