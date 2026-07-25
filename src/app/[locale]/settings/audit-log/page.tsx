"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface AuditEntry {
  id: string
  action: string
  resourceType: string
  resourceId: string | null
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/audit-log")
      .then((r) => r.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
      <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="card-double"><div className="card-inner h-12" /></div>))}</div>
    </div>
  )

  const actionColor: Record<string, string> = {
    CREATE: "bg-success/10 text-success",
    UPDATE: "bg-info/10 text-info",
    DELETE: "bg-danger/10 text-danger",
    LOGIN: "bg-accent-primary/10 text-accent-primary",
    LOGOUT: "bg-text-muted/10 text-text-muted",
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Audit Log</h1>
        </div>
        <span className="badge bg-bg-elevated text-text-secondary">{logs.length} entries</span>
      </header>

      {logs.length === 0 ? (
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner text-center py-16">
            <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-text-muted text-lg font-medium" style={{ fontFamily: "var(--font-poppins)" }}>No Audit Entries</p>
            <p className="text-text-muted text-sm mt-1">Activity logs will appear here as you use the platform</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((entry, i) => {
            const actionBase = entry.action.split("_")[0]
            return (
              <div
                key={entry.id}
                className={`card-double animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="card-inner flex items-center gap-4">
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-accent-primary/40" />
                    <div className="w-px h-8 bg-border-subtle" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[10px] ${actionColor[actionBase] || "bg-text-muted/10 text-text-muted"}`}>
                        {entry.action}
                      </span>
                      <span className="text-xs text-text-secondary font-medium">{entry.resourceType}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {entry.resourceId && <>Resource: {entry.resourceId} · </>}
                      {entry.ipAddress && <>IP: {entry.ipAddress} · </>}
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <p className="text-[10px] text-text-muted mt-1 font-mono">
                        {JSON.stringify(entry.metadata).slice(0, 200)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
