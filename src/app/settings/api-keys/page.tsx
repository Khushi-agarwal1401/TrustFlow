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
    <div className="max-w-3xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>API Keys</h1>
        </div>
      </header>

      <div className="card-double mb-6 animate-fade-up stagger-1">
        <div className="card-inner">
          <h3 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Create New Key</h3>
          <div className="flex gap-2 mb-3">
            <input className="input flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name (e.g., CI/CD)" />
            <button onClick={createKey} disabled={creating} className="btn-primary text-sm whitespace-nowrap">
              {creating ? "Creating..." : "Create Key"}
            </button>
          </div>
          {newKey && (
            <div className="p-4 bg-accent-subtle rounded-xl animate-fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted mb-1">Copy this key now — you won&apos;t see it again!</p>
                  <code className="text-sm text-accent-primary break-all bg-bg-base px-2 py-1 rounded">{newKey}</code>
                  <button onClick={() => copyToClipboard(newKey)} className="btn-ghost text-xs mt-2">Copy to clipboard</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 animate-fade-up stagger-2">
        <h3 className="font-semibold text-sm text-text-muted uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Existing Keys</h3>
        {keys.length === 0 ? (
          <div className="card-double"><div className="card-inner text-center py-8">
            <p className="text-text-muted text-sm">No API keys yet — create one above</p>
          </div></div>
        ) : (
          keys.map((key, i) => (
            <div key={key.id} className={`card-double animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="card-inner flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">{key.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {key.scopes.join(", ")}
                    {" · "}{key.lastUsedAt ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                    {" · "}Created {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => deleteKey(key.id)} className="text-danger text-sm hover:underline ml-3 shrink-0">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
