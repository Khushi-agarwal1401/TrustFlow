"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function MilestoneActions({ milestoneId }: { milestoneId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    const res = await fetch(`/api/milestones/${milestoneId}/approve`, { method: "POST" })
    if (res.ok) {
      router.refresh()
    } else {
      alert("Failed to approve")
      setLoading(false)
    }
  }

  async function handleReject() {
    const reason = prompt("Reason for rejection?")
    if (!reason) return

    setLoading(true)
    const res = await fetch(`/api/milestones/${milestoneId}/reject`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }) 
    })
    
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || "Failed to reject")
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 flex gap-2">
      <button 
        onClick={handleReject} 
        disabled={loading}
        className="btn-ghost py-1 px-3 text-xs border-danger text-danger hover:bg-danger/10"
      >
        Request Revision
      </button>
      
      <button 
        onClick={handleApprove} 
        disabled={loading}
        className="btn-primary py-1 px-3 text-xs"
      >
        Approve & Release
      </button>
    </div>
  )
}
