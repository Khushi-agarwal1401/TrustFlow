"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function ProjectActions({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [email, setEmail] = useState("")
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  async function handleGenerateContract() {
    setLoading(true)
    await fetch("/api/contracts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    })
    setLoading(false)
    router.refresh()
  }

  async function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch(`/api/projects/${projectId}/send-invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.inviteUrl) {
      setInviteLink(data.inviteUrl)
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={handleGenerateContract} disabled={loading} className="btn-primary w-full">
        {loading ? "Generating..." : "Generate Contract with AI"}
      </button>

      <button onClick={() => setShowInvite(!showInvite)} className="btn-ghost w-full">
        {showInvite ? "Cancel" : "Invite Freelancer"}
      </button>

      {showInvite && (
        <form onSubmit={handleSendInvite} className="space-y-2 p-3 bg-bg-elevated rounded-lg">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="freelancer@example.com"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm">
            {loading ? "Sending..." : "Send Invite"}
          </button>
          {inviteLink && (
            <div className="mt-2 p-2 bg-accent-subtle rounded text-xs break-all">
              <p className="text-text-muted mb-1">Invite sent! Share this link:</p>
              <code className="text-accent-primary">{inviteLink}</code>
            </div>
          )}
        </form>
      )}
    </div>
  )
}
