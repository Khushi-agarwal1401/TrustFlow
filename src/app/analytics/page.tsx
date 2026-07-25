"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Analytics {
  overview: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    disputedProjects: number
    totalRevenue: number
    activeRevenue: number
    completionRate: number
    avgProjectValue: number
  }
  monthlyRevenue: { month: string; total: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/overview").then((r) => r.json()).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-6 text-text-muted">Loading analytics...</div>
  if (!data) return <div className="p-6 text-text-muted">No data</div>

  const { overview } = data

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Link href="/" className="text-text-secondary text-sm hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="text-2xl font-bold mt-4 mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Analytics</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-2xl font-bold text-accent-primary">${(overview.totalRevenue / 100).toLocaleString()}</p>
          <p className="text-text-muted text-sm">Total Revenue</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-success">{overview.completedProjects}</p>
          <p className="text-text-muted text-sm">Completed Projects</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-info">{overview.completionRate}%</p>
          <p className="text-text-muted text-sm">Completion Rate</p>
        </div>
        <div className="card p-4">
          <p className="text-2xl font-bold text-warning">${(overview.avgProjectValue / 100).toLocaleString()}</p>
          <p className="text-text-muted text-sm">Avg Project Value</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-3">Project Status Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: "Active", count: overview.activeProjects, color: "bg-accent-primary" },
              { label: "Completed", count: overview.completedProjects, color: "bg-success" },
              { label: "Disputed", count: overview.disputedProjects, color: "bg-danger" },
              { label: "Total", count: overview.totalProjects, color: "bg-text-muted" },
            ].map((item) => {
              const pct = overview.totalProjects > 0 ? Math.round((item.count / overview.totalProjects) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.label}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold mb-3">Monthly Revenue</h3>
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-text-muted text-sm">No revenue data yet</p>
          ) : (
            <div className="space-y-2">
              {data.monthlyRevenue.slice(0, 6).map((r) => {
                const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.total))
                const pct = maxRevenue > 0 ? (r.total / maxRevenue) * 100 : 0
                return (
                  <div key={r.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{r.month}</span>
                      <span className="font-medium">${(r.total / 100).toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
