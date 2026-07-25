"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"

export default function OrgInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [org, setOrg] = useState<{ name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/invite/organization/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setOrg(d.organization)
        setLoading(false)
      })
      .catch(() => { setError("Failed to load"); setLoading(false) })
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    const res = await fetch(`/api/invite/organization/${token}/accept`, { method: "POST" })
    if (res.ok) router.push("/settings/organization")
    setAccepting(false)
  }

  if (loading) return <div className="p-6 text-text-muted text-center">Loading invite...</div>
  if (error) return <div className="p-6 text-danger text-center">{error}</div>
  if (!org) return <div className="p-6 text-text-muted text-center">Invite not found</div>

  return (
    <div className="max-w-md mx-auto p-6 mt-12">
      <div className="card p-6 text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Organization Invite</h1>
        <p className="text-text-secondary mb-6">You've been invited to join <strong>{org.name}</strong></p>

        {session?.user ? (
          <button onClick={handleAccept} disabled={accepting} className="btn-primary w-full">
            {accepting ? "Accepting..." : "Accept Invite"}
          </button>
        ) : (
          <div>
            <p className="text-text-muted text-sm mb-3">Sign in to accept this invite</p>
            <button onClick={() => signIn(undefined, { callbackUrl: `/invite/organization/${token}` })} className="btn-primary w-full">
              Sign in to Accept
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
