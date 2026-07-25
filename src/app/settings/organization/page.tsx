"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Org {
  id: string
  name: string
  slug: string
  ownerId: string
  members: { id: string; userId: string; role: string; user: { id: string; name: string; email: string } }[]
  _count: { members: number; projects: number }
  currentMemberRole?: string
}

export default function OrganizationSettings() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [selected, setSelected] = useState<Org | null>(null)
  const [newName, setNewName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch("/api/organizations").then((r) => r.json()).then((data) => {
      setOrgs(data)
      setLoading(false)
      if (data.length > 0) {
        setSelected(data[0])
        setNewName(data[0].name)
      }
    })
  }, [])

  async function createOrg() {
    if (!newName) return
    setCreating(true)
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    const data = await res.json()
    if (res.ok) {
      setOrgs((prev) => [...prev, data])
      setSelected(data)
      setNewName("")
    }
    setCreating(false)
  }

  async function sendInvite() {
    if (!selected || !inviteEmail) return
    await fetch(`/api/organizations/${selected.id}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: "MEMBER" }),
    })
    setInviteEmail("")
  }

  async function removeMember(userId: string) {
    if (!selected) return
    await fetch(`/api/organizations/${selected.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const res = await fetch(`/api/organizations/${selected.id}`)
    const updated = await res.json()
    setSelected(updated)
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Organizations</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3 animate-fade-up stagger-1">
          <h2 className="font-semibold text-sm text-text-muted uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Your Organizations</h2>
          {orgs.map((org, i) => (
            <button
              key={org.id}
              onClick={() => { setSelected(org); setNewName(org.name) }}
              className={`w-full text-left card-double transition-all duration-200 animate-fade-up stagger-${Math.min(i + 1, 6)} ${selected?.id === org.id ? "border-accent-primary" : ""}`}
            >
              <div className="card-inner py-3">
                <p className="font-medium text-sm">{org.name}</p>
                <p className="text-text-muted text-xs mt-0.5">{org._count.members} members · {org._count.projects} projects</p>
              </div>
            </button>
          ))}
          <div className="card-double">
            <div className="card-inner flex gap-2">
              <input className="input text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New org name" />
              <button onClick={createOrg} disabled={creating || !newName} className="btn-primary text-sm whitespace-nowrap">Create</button>
            </div>
          </div>
        </div>

        {selected && (
          <div className="lg:col-span-2 space-y-6 animate-fade-up stagger-2">
            <div className="card-double">
              <div className="card-inner">
                <h2 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>{selected.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-text-muted">Slug</span><p className="font-medium">{selected.slug}</p></div>
                  <div><span className="text-text-muted">Members</span><p className="font-medium">{selected._count.members}</p></div>
                  <div><span className="text-text-muted">Projects</span><p className="font-medium">{selected._count.projects}</p></div>
                  <div><span className="text-text-muted">Your Role</span><p className="font-medium capitalize">{selected.currentMemberRole?.toLowerCase()}</p></div>
                </div>
              </div>
            </div>

            {selected.currentMemberRole === "OWNER" && (
              <>
                <div className="card-double">
                  <div className="card-inner">
                    <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Invite Member</h3>
                    <div className="flex gap-2">
                      <input className="input flex-1" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" />
                      <button onClick={sendInvite} disabled={!inviteEmail} className="btn-primary text-sm">Send Invite</button>
                    </div>
                  </div>
                </div>

                <div className="card-double">
                  <div className="card-inner">
                    <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Members</h3>
                    <div className="space-y-2">
                      {selected.members.map((m) => (
                        <div key={m.id} className="card-elevated rounded-xl p-3 flex items-center justify-between transition-colors hover:border-accent-primary/20">
                          <div>
                            <p className="text-sm font-medium">{m.user.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">{m.user.email} · <span className="capitalize">{m.role.toLowerCase()}</span></p>
                          </div>
                          {m.role !== "OWNER" && (
                            <button onClick={() => removeMember(m.userId)} className="text-danger text-sm hover:underline">Remove</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
