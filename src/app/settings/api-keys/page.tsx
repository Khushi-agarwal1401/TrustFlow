"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface ApiKey {
  id: string
  name: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetch("/api/api-keys").then((r) => r.json()).then((data) => {
      setKeys(data)
      setLoading(false)
    })
  }, [])

  async function createKey() {
    setCreating(true)
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || "Untitled", scopes: ["read:projects"] }),
    })
    const data = await res.json()
    if (res.ok) {
      setNewKey(data.rawKey)
      setKeys((prev) => [...prev, { id: data.id, name: data.name, scopes: data.scopes, lastUsedAt: null, expiresAt: null, createdAt: data.createdAt }])
      setName("")
    }
    setCreating(false)
  }

  async function deleteKey(id: string) {
    await fetch("/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setKeys((prev) => prev.filter((k) => k.id !== id))
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>API Keys</h1>

      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Create New Key</h3>
        <div className="flex gap-2 mb-3">
          <input className="input flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g., CI/CD)" />
          <button onClick={createKey} disabled={creating} className="btn-primary text-sm whitespace-nowrap">
            {creating ? "Creating..." : "Create Key"}
          </button>
        </div>
        {newKey && (
          <div className="p-3 bg-accent-subtle rounded-lg">
            <p className="text-xs text-text-muted mb-1">Copy this key now — you won't see it again!</p>
            <code className="text-sm text-accent-primary break-all">{newKey}</code>
            <button onClick={() => copyToClipboard(newKey)} className="btn-ghost text-xs mt-2">Copy</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {keys.length === 0 ? (
          <p className="text-text-muted text-sm">No API keys yet</p>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{key.name}</p>
                <p className="text-xs text-text-muted">
                  {key.scopes.join(", ")} · {key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"} · Created {new Date(key.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => deleteKey(key.id)} className="text-danger text-sm">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
