"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ReplaceFreelancerProps {
  projectId: string
  isClient: boolean
  hasFreelancer: boolean
}

export function ReplaceFreelancer({ projectId, isClient, hasFreelancer }: ReplaceFreelancerProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)

  if (!isClient || !hasFreelancer) return null

  async function handleReplace(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    setInviteUrl(null)

    const res = await fetch(`/api/projects/${projectId}/replace-freelancer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newFreelancerEmail: email }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Failed to replace freelancer")
      setLoading(false)
      return
    }

    setInviteUrl(data.inviteUrl)
    setLoading(false)
  }

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="text-sm text-danger hover:underline transition">
        {showForm ? "Cancel" : "Replace Freelancer"}
      </button>

      {showForm && (
        <form onSubmit={handleReplace} className="mt-3 space-y-3 p-4 bg-bg-elevated rounded-xl border border-border-subtle">
          <p className="text-xs text-text-muted">
            This will reset milestone statuses and send a new invite to the replacement freelancer.
          </p>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="New freelancer email"
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          {inviteUrl && (
            <div className="p-3 bg-accent-subtle rounded-lg">
              <p className="text-xs text-text-muted mb-1">Share this invite link with the new freelancer:</p>
              <code className="text-xs text-accent-primary break-all">{inviteUrl}</code>
            </div>
          )}
          <button type="submit" disabled={loading || !email.trim()} className="btn-primary text-sm w-full">
            {loading ? "Replacing..." : "Replace & Send Invite"}
          </button>
        </form>
      )}
    </div>
  )
}
