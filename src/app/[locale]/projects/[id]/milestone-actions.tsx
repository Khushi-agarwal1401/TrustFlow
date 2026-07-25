"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface MilestoneActionsProps {
  milestoneId: string
  milestoneStatus: string
  isClient: boolean
}

export function MilestoneActions({ milestoneId, milestoneStatus, isClient }: MilestoneActionsProps) {
  const router = useRouter()
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!isClient || milestoneStatus !== "SUBMITTED") return null

  async function handleApprove() {
    setActionLoading(true)
    setActionError(null)
    const res = await fetch(`/api/milestones/${milestoneId}/approve`, { method: "POST" })
    const data = await res.json()
    if (!res.ok) {
      setActionError(data.error || "Failed to approve")
      setActionLoading(false)
      return
    }
    setActionLoading(false)
    router.refresh()
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActionLoading(true)
    setActionError(null)
    const res = await fetch(`/api/milestones/${milestoneId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    })
    const data = await res.json()
    if (!res.ok) {
      setActionError(data.error || "Failed to reject")
      setActionLoading(false)
      return
    }
    setActionLoading(false)
    setRejectModal(false)
    setRejectReason("")
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={handleApprove}
          disabled={actionLoading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-success/20 text-success hover:bg-success/30 transition disabled:opacity-50"
        >
          {actionLoading ? "..." : "Approve"}
        </button>
        <button
          onClick={() => setRejectModal(true)}
          disabled={actionLoading}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition disabled:opacity-50"
        >
          Request Revision
        </button>
        {actionError && <span className="text-xs text-danger ml-2">{actionError}</span>}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="card-double max-w-md w-full mx-4 animate-fade-up">
            <div className="card-inner space-y-4">
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Request Revision</h3>
              <p className="text-sm text-text-secondary">Explain what needs to be changed so the freelancer can revise.</p>
              <textarea
                className="input min-h-[100px] resize-y"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Describe what needs to be revised..."
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setRejectModal(false); setRejectReason(""); setActionError(null) }} className="btn-ghost text-sm">
                  Cancel
                </button>
                <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="btn-primary text-sm">
                  {actionLoading ? "Sending..." : "Request Revision"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
