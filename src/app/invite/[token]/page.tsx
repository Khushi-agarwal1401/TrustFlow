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
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load invite")
        setLoading(false)
      })
  }, [token])

  async function handleRespond(action: "ACCEPT" | "DECLINE") {
    setResponding(true)
    const res = await fetch(`/api/invite/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    const d = await res.json()
    if (res.ok && action === "ACCEPT") {
      router.push(`/projects/${data?.project.id}`)
    } else {
      setResponding(false)
      router.push("/")
    }
  }

  if (loading) return <div className="p-6 text-text-muted text-center">Loading invite...</div>
  if (error) return <div className="p-6 text-danger text-center">{error}</div>
  if (!data) return <div className="p-6 text-text-muted text-center">Invite not found</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-poppins)" }}>
          You're invited!
        </h1>
        <p className="text-text-secondary mb-6">
          <strong>{data.project.client.name}</strong> wants you to collaborate on <strong>{data.project.title}</strong>
        </p>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-text-secondary">{data.project.description}</p>

          <div className="card p-4">
            <h3 className="font-semibold mb-3">Milestones</h3>
            <div className="space-y-2">
              {data.project.milestones.map((m, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{i + 1}. {m.title}</span>
                  <span className="font-medium">${(m.amount / 100).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold pt-2 border-t border-border-subtle">
                <span>Total</span>
                <span>${(data.project.totalAmount / 100).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {data.project.aiGeneratedDraft?.terms && (
            <div className="card p-4">
              <h3 className="font-semibold mb-2">Terms</h3>
              <p className="text-sm text-text-secondary">{data.project.aiGeneratedDraft.terms}</p>
            </div>
          )}
        </div>

        {session?.user ? (
          <div className="flex gap-3">
            <button onClick={() => handleRespond("ACCEPT")} disabled={responding} className="btn-primary flex-1">
              {responding ? "Accepting..." : "Accept Contract"}
            </button>
            <button onClick={() => handleRespond("DECLINE")} disabled={responding} className="btn-ghost flex-1">
              Decline
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-text-muted text-sm mb-3">Sign in to respond to this invite</p>
            <button onClick={() => signIn(undefined, { callbackUrl: `/invite/${token}` })} className="btn-primary">
              Sign in to Accept
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
