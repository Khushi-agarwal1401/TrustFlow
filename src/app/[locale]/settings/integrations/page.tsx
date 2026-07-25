"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { IntegrationDeliveries } from "../integration-deliveries"

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

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
    </div>
  )

  const providerColors: Record<string, string> = {
    GITHUB: "bg-gray-700", GITLAB: "bg-orange-600", SLACK: "bg-purple-600", LINEAR: "bg-indigo-600", CUSTOM: "bg-bg-elevated",
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Integrations</h1>
        </div>
      </header>

      <form onSubmit={createIntegration} className="card-double mb-6 animate-fade-up stagger-1">
        <div className="card-inner space-y-4">
          <h3 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>New Webhook</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Integration name" required />
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
        </div>
      </form>

      <div className="space-y-3 animate-fade-up stagger-2">
        {integrations.length === 0 ? (
          <div className="card-double"><div className="card-inner text-center py-8">
            <p className="text-text-muted text-sm">No integrations yet — create one above</p>
          </div></div>
        ) : (
          integrations.map((i, idx) => (
            <div key={i.id} className={`card-double animate-fade-up stagger-${Math.min(idx + 1, 6)}`}>
              <div className="card-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg ${providerColors[i.provider] || "bg-bg-elevated"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {i.provider.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{i.name} <span className="text-xs text-text-muted uppercase">{i.provider}</span></p>
                      <p className="text-xs text-text-muted mt-0.5">{i.project.title} · {i.events.join(", ")} · {i._count.deliveries} deliveries</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${i.isActive ? "bg-success" : "bg-text-muted"}`} />
                    {i.lastTriggeredAt && (
                      <span className="text-xs text-text-muted">{new Date(i.lastTriggeredAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-border-subtle">
                  <IntegrationDeliveries integrationId={i.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
