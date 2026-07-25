"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Webhook {
  id: string
  name: string
  provider: string
  webhookUrl: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: string | null
  project: { title: string }
  _count: { deliveries: number }
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Webhook[]>([])
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState("")
  const [name, setName] = useState("")
  const [provider, setProvider] = useState("GITHUB")
  const [webhookUrl, setWebhookUrl] = useState("")

  useEffect(() => {
    fetch("/api/integrations").then((r) => r.json()).then((data) => {
      setIntegrations(data)
      setLoading(false)
    })
  }, [])

  async function createIntegration(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, name, provider, webhookUrl, events: ["push", "pull_request"] }),
    })
    if (res.ok) {
      setName(""); setWebhookUrl(""); setProjectId("")
      const data = await fetch("/api/integrations").then((r) => r.json())
      setIntegrations(data)
    }
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Integrations</h1>

      <form onSubmit={createIntegration} className="card p-4 mb-6 space-y-3">
        <h3 className="font-semibold">New Webhook</h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
            <option value="GITHUB">GitHub</option>
            <option value="GITLAB">GitLab</option>
            <option value="SLACK">Slack</option>
            <option value="LINEAR">Linear</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <input className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="Project ID" required />
          <input className="input" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="Webhook URL" required />
        </div>
        <button type="submit" className="btn-primary">Create Webhook</button>
      </form>

      <div className="space-y-3">
        {integrations.length === 0 ? (
          <p className="text-text-muted text-sm">No integrations yet</p>
        ) : (
          integrations.map((i) => (
            <div key={i.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{i.name} <span className="text-xs text-text-muted uppercase">{i.provider}</span></p>
                <p className="text-xs text-text-muted">{i.project.title} · {i.events.join(", ")} · {i._count.deliveries} deliveries</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${i.isActive ? "bg-success" : "bg-text-muted"}`} />
                {i.lastTriggeredAt && <span className="text-xs text-text-muted">{new Date(i.lastTriggeredAt).toLocaleDateString()}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
