"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

interface InviteData {
  project: {
    id: string
    title: string
    description: string
    totalAmount: number
    client: { name: string; email: string }
    milestones: { title: string; amount: number; sequence: number }[]
    aiGeneratedDraft: { terms?: string } | null
  }
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError("Invalid or expired invite"))
      .finally(() => setLoading(false))
  }, [token])

  async function handleRespond(accept: boolean) {
    if (!session) {
      signIn()
      return
    }
    setResponding(true)
    const res = await fetch(`/api/invite/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accept }),
    })
    if (res.ok) {
      router.push(accept ? `/projects/${data!.project.id}` : "/")
    } else {
      setError("Failed to respond to invite")
    }
    setResponding(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
      <div className="card-double max-w-lg w-full"><div className="card-inner space-y-4 p-8"><div className="skeleton h-6 w-48 mx-auto" /><div className="skeleton h-3 w-64 mx-auto" /><div className="skeleton h-3 w-full" /></div></div>
    </div>
  )

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
      <div className="card-double"><div className="card-inner text-center py-8 px-12">
        <p className="text-text-secondary">{error || "Invite not found"}</p>
      </div></div>
    </div>
  )

  const { project } = data

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-base">
      <div className="max-w-lg w-full animate-fade-up">
        <div className="card-double">
          <div className="card-inner p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Project Invitation</h1>
              <p className="text-text-secondary text-sm mt-1">
                <span className="font-medium text-text-primary">{project.client.name}</span> invited you to collaborate
              </p>
            </div>

            <div className="card-elevated rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm text-text-muted">Project</p>
                <p className="font-semibold">{project.title}</p>
              </div>
              {project.description && (
                <div>
                  <p className="text-sm text-text-muted">Description</p>
                  <p className="text-sm text-text-secondary">{project.description}</p>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Budget</span>
                <span className="font-semibold">${(project.totalAmount / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Milestones</span>
                <span className="font-semibold">{project.milestones.length}</span>
              </div>
            </div>

            {project.milestones.length > 0 && (
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">Milestones</p>
                <div className="space-y-2">
                  {project.milestones.map((m) => (
                    <div key={m.sequence} className="flex items-center justify-between text-sm card-elevated rounded-lg px-3 py-2">
                      <span>{m.sequence}. {m.title}</span>
                      <span className="font-medium">${(m.amount / 100).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.aiGeneratedDraft?.terms && (
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">Terms Preview</p>
                <p className="text-xs text-text-secondary bg-bg-base rounded-lg p-3 max-h-24 overflow-y-auto">{project.aiGeneratedDraft.terms}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={() => handleRespond(false)} disabled={responding} className="btn-ghost flex-1">
                {responding ? "Processing..." : "Decline"}
              </button>
              <button onClick={() => handleRespond(true)} disabled={responding} className="btn-primary flex-1">
                {responding ? "Processing..." : "Accept Invite"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
