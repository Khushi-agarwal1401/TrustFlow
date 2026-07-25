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

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Organizations</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-text-muted uppercase tracking-wider">Your Organizations</h2>
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => { setSelected(org); setNewName(org.name) }}
              className={`w-full text-left card p-3 text-sm hover:bg-bg-hover ${selected?.id === org.id ? "border-accent-primary border" : ""}`}
            >
              <p className="font-medium">{org.name}</p>
              <p className="text-text-muted text-xs">{org._count.members} members · {org._count.projects} projects</p>
            </button>
          ))}
          <div className="flex gap-2">
            <input className="input text-sm" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New org name" />
            <button onClick={createOrg} disabled={creating || !newName} className="btn-primary text-sm whitespace-nowrap">Create</button>
          </div>
        </div>

        {selected && (
          <div className="col-span-2 space-y-6">
            <div className="card p-4">
              <h2 className="font-semibold mb-3">{selected.name}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Slug</span><span>{selected.slug}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Members</span><span>{selected._count.members}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Projects</span><span>{selected._count.projects}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Your Role</span><span className="capitalize">{selected.currentMemberRole}</span></div>
              </div>
            </div>

            {selected.currentMemberRole === "OWNER" && (
              <>
                <div className="card p-4">
                  <h3 className="font-semibold mb-3">Invite Member</h3>
                  <div className="flex gap-2">
                    <input className="input flex-1" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" />
                    <button onClick={sendInvite} disabled={!inviteEmail} className="btn-primary text-sm">Send Invite</button>
                  </div>
                </div>

                <div className="card p-4">
                  <h3 className="font-semibold mb-3">Members</h3>
                  <div className="space-y-2">
                    {selected.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 bg-bg-elevated rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{m.user.name}</p>
                          <p className="text-xs text-text-muted">{m.user.email} · <span className="capitalize">{m.role.toLowerCase()}</span></p>
                        </div>
                        {m.role !== "OWNER" && (
                          <button onClick={() => removeMember(m.userId)} className="text-danger text-sm">Remove</button>
                        )}
                      </div>
                    ))}
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
