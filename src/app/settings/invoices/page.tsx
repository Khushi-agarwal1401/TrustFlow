"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Invoice {
  id: string
  totalAmount: number
  status: string
  dueDate: string | null
  createdAt: string
  project: { title: string }
  fromUser: { name: string }
  toUser: { name: string }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/invoices").then((r) => r.json()).then((data) => {
      setInvoices(data)
      setLoading(false)
    })
  }, [])

  const statusColor: Record<string, string> = {
    DRAFT: "bg-text-muted/10 text-text-muted",
    SENT: "bg-info/10 text-info",
    PAID: "bg-success/10 text-success",
    OVERDUE: "bg-danger/10 text-danger",
    CANCELLED: "bg-text-muted/10 text-text-muted",
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8"><div className="skeleton h-5 w-24" /></header>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Invoices</h1>
        </div>
        <span className="badge bg-bg-elevated text-text-secondary">{invoices.length} total</span>
      </header>

      {invoices.length === 0 ? (
        <div className="card-double animate-fade-up stagger-1">
          <div className="card-inner text-center py-12">
            <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-text-muted">No invoices yet</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv, i) => (
            <div key={inv.id} className={`card-double animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="card-inner flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{inv.project.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{inv.fromUser.name} → {inv.toUser.name}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>${(inv.totalAmount / 100).toLocaleString()}</p>
                  <span className={`badge mt-1 ${statusColor[inv.status] || "bg-text-muted/10 text-text-muted"}`}>
                    {inv.status.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
