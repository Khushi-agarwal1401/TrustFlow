"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface DisputeItem {
  id: string
  status: string
  createdAt: string
  milestone: { title: string; project: { title: string; id: string } }
  opener: { name: string }
  _count: { evidences: number }
}

export default function DisputesListPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/disputes")
      .then((r) => r.json())
      .then((data) => {
        setDisputes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    EVIDENCE_PENDING: "bg-warning/10 text-warning",
    AI_SUGGESTED: "bg-info/10 text-info",
    RESOLVED_ACCEPTED: "bg-success/10 text-success",
    ESCALATED: "bg-danger/10 text-danger",
    RESOLVED_ADMIN: "bg-success/10 text-success",
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
      <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="card-double"><div className="card-inner h-16" /></div>))}</div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Disputes</h1>
        </div>
        <span className="badge bg-accent-subtle text-accent-primary">{disputes.length} total</span>
      </header>

      {disputes.length === 0 ? (
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner text-center py-16">
            <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p className="text-text-muted text-lg font-medium" style={{ fontFamily: "var(--font-poppins)" }}>No Disputes</p>
            <p className="text-text-muted text-sm mt-1">All projects are running smoothly</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d, i) => (
            <Link
              key={d.id}
              href={`/disputes/${d.id}`}
              className={`card-double block transition-all duration-200 hover:border-accent-primary/30 animate-fade-up stagger-${Math.min(i + 1, 6)}`}
            >
              <div className="card-inner flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm truncate">{d.milestone.project.title}</p>
                    <span className="text-text-muted text-xs">/</span>
                    <span className="text-text-secondary text-xs truncate">{d.milestone.title}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Opened by {d.opener.name} · {d._count.evidences} evidence items · {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className={`badge ${statusColor[d.status] || "bg-text-muted/10 text-text-muted"}`}>
                    {d.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
