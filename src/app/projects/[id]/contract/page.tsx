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
  const [saving, setSaving] = useState(false)

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

  function addMilestone() {
    setMilestones((prev) => [...prev, {
      title: "",
      deliverableDescription: "",
      amount: 0,
      sequence: prev.length + 1,
    }])
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, sequence: i + 1 })))
  }

  function updateMilestone(index: number, field: keyof Milestone, value: string | number) {
    setMilestones((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones, terms }),
    })
    setSaving(false)
    router.push(`/projects/${id}`)
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="card-double"><div className="card-inner space-y-4"><div className="skeleton h-6 w-48" /><div className="skeleton h-32 w-full" /><div className="skeleton h-8 w-24" /></div></div>
    </div>
  )

  const totalAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to Project</Link>

      <div className="mt-6 space-y-6">
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Milestones</h2>
              <button onClick={addMilestone} className="btn-ghost text-sm">+ Add Milestone</button>
            </div>

            {milestones.length === 0 ? (
              <p className="text-text-muted text-sm py-4 text-center">No milestones yet. Add one to define the project scope.</p>
            ) : (
              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="card-elevated rounded-xl p-4 space-y-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="flex items-center justify-between">
                      <span className="badge bg-accent-subtle text-accent-primary">Step {i + 1}</span>
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(i)} className="text-danger text-xs hover:underline">Remove</button>
                      )}
                    </div>
                    <input className="input" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} placeholder="Milestone title" />
                    <textarea className="input min-h-[60px] resize-y" value={m.deliverableDescription} onChange={(e) => updateMilestone(i, "deliverableDescription", e.target.value)} placeholder="What needs to be delivered?" />
                    <input className="input" type="number" value={m.amount || ""} onChange={(e) => updateMilestone(i, "amount", parseFloat(e.target.value) || 0)} placeholder="Amount (USD)" />
                  </div>
                ))}
              </div>
            )}

            {milestones.length > 0 && (
              <div className="flex justify-between items-center p-3 bg-bg-elevated rounded-xl">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg" style={{ fontFamily: "var(--font-poppins)" }}>${totalAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-double animate-fade-up stagger-2">
          <div className="card-inner space-y-3">
            <h2 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Terms & Conditions</h2>
            <textarea
              className="input min-h-[150px] resize-y font-mono text-sm"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Define the legal terms and conditions for this project..."
            />
          </div>
        </div>

        <div className="flex gap-3 animate-fade-up stagger-3">
          <Link href={`/projects/${id}`} className="btn-ghost">Cancel</Link>
          <button onClick={handleSave} disabled={saving || milestones.length === 0} className="btn-primary">
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  )
}
