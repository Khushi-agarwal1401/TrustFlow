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
    DRAFT: "text-text-muted",
    SENT: "text-info",
    PAID: "text-success",
    OVERDUE: "text-danger",
    CANCELLED: "text-text-muted",
  }

  if (loading) return <div className="p-6 text-text-muted">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Invoices</h1>

      {invoices.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{inv.project.title}</p>
                <p className="text-xs text-text-muted">{inv.fromUser.name} → {inv.toUser.name}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">${(inv.totalAmount / 100).toLocaleString()}</p>
                <p className={`text-xs capitalize ${statusColor[inv.status] || "text-text-muted"}`}>{inv.status.toLowerCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
