"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { AISplitMilestones } from "../ai-split-milestones-modal"

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
  const { data: session } = useSession()
  const router = useRouter()
  const [projectData, setProjectData] = useState<{ clientId?: string } | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [terms, setTerms] = useState("")
  const [budget, setBudget] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProjectData(data)
        if (data.totalAmount) setBudget(data.totalAmount / 100)
        if (data.milestones) {
          setMilestones(data.milestones.map((m: Milestone) => ({ ...m, amount: m.amount / 100 })))
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
    const formattedMilestones = milestones.map(m => ({ ...m, amount: Math.round(m.amount * 100) }))
    await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ milestones: formattedMilestones, terms }),
    })
    setSaving(false)
    router.push(`/projects/${id}`)
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <div className="skeleton h-5 w-24 mb-8" />
      <div className="card p-6 space-y-4"><div className="skeleton h-6 w-48" /><div className="skeleton h-32 w-full" /><div className="skeleton h-8 w-24" /></div>
    </div>
  )

  const totalAmount = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0)
  const isMathValid = totalAmount === budget

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 pb-32 relative min-h-screen">
      <Link href={`/projects/${id}`} className="text-text-secondary text-sm hover:text-text-primary transition">&larr; Back to Project</Link>

      <div className="mt-6 space-y-6">
        <div className="card p-6 animate-fade-up stagger-1 border border-border-default shadow-sm">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Milestones</h2>
              <div className="flex items-center gap-2">
                {projectData && (
                  <AISplitMilestones
                    projectId={id}
                    isClient={session?.user?.id === projectData.clientId}
                    existingCount={milestones.length}
                  />
                )}
                <button onClick={addMilestone} className="btn-ghost text-sm">+ Add Milestone</button>
              </div>
            </div>

            {milestones.length === 0 ? (
              <p className="text-text-muted text-sm py-4 text-center">No milestones yet. Add one to define the project scope.</p>
            ) : (
              <div className="space-y-6 pl-4 border-l-2 border-border-subtle relative">
                {milestones.map((m, i) => (
                  <div key={i} className="relative space-y-4 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <div className="absolute -left-[29px] top-1 w-6 h-6 rounded-full bg-bg-surface border-2 border-accent-primary flex items-center justify-center text-xs font-bold text-accent-primary">
                      {i + 1}
                    </div>
                    <div className="flex items-center justify-between">
                      <input className="input text-lg font-medium bg-transparent border-none px-0 focus:ring-0 shadow-none placeholder-text-muted" value={m.title} onChange={(e) => updateMilestone(i, "title", e.target.value)} placeholder="Milestone title" />
                      {milestones.length > 1 && (
                        <button onClick={() => removeMilestone(i)} className="text-danger text-xs hover:underline flex-shrink-0">Remove</button>
                      )}
                    </div>
                    <textarea className="input min-h-[80px] resize-y bg-bg-elevated border-border-subtle leading-relaxed" value={m.deliverableDescription} onChange={(e) => updateMilestone(i, "deliverableDescription", e.target.value)} placeholder="What needs to be delivered?" />
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary">$</span>
                      <input className="input max-w-[150px] font-mono bg-bg-elevated border-border-subtle" type="number" value={m.amount || ""} onChange={(e) => updateMilestone(i, "amount", parseFloat(e.target.value) || 0)} placeholder="Amount" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6 animate-fade-up stagger-2 border border-border-default shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Terms & Conditions</h2>
            <textarea
              className="input min-h-[200px] resize-y font-mono text-sm leading-relaxed bg-bg-elevated border-border-subtle"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Define the legal terms and conditions for this project..."
            />
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-border-subtle bg-bg-surface z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.5)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Running Total</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${isMathValid ? 'text-success' : 'text-danger'}`}>${totalAmount.toLocaleString()}</span>
              <span className="text-sm text-text-muted font-mono">/ ${budget.toLocaleString()} budget</span>
            </div>
            {!isMathValid && <span className="text-xs text-danger mt-1">Total must match the budget</span>}
          </div>
          
          <div className="flex gap-3">
            <Link href={`/projects/${id}`} className="btn-ghost">Cancel</Link>
            <button onClick={handleSave} disabled={saving || milestones.length === 0 || !isMathValid} className="btn-primary flex items-center gap-2">
              {saving ? "Saving..." : "Save Contract"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
