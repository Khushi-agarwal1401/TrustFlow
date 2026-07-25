"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface AISplitMilestonesProps {
  projectId: string
  isClient: boolean
  existingCount: number
}

export function AISplitMilestones({ projectId, isClient, existingCount }: AISplitMilestonesProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [count, setCount] = useState(Math.max(existingCount || 4, 2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isClient) return null

  async function handleSplit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/split-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, count }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Split failed")
      setShowModal(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Split failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-ghost text-sm flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        AI Split Milestones
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card-double max-w-md w-full mx-4 animate-fade-up">
            <div className="card-inner space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>AI Split Milestones</h3>
                  <p className="text-xs text-text-secondary">Automatically split your project into milestones using AI</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-text-secondary mb-1.5 block">Number of milestones</label>
                <input
                  className="input"
                  type="number"
                  min={2}
                  max={10}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 4)}
                />
                <p className="text-[10px] text-text-muted mt-1">Existing milestones will be replaced. Recommended: 3-6.</p>
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSplit} disabled={loading || count < 2} className="btn-primary text-sm">
                  {loading ? "Splitting..." : `Generate ${count} Milestones`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
