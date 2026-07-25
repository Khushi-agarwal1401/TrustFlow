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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <header className="glass-strong rounded-2xl px-6 py-3 mb-8">
          <div className="skeleton h-5 w-32" />
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-double"><div className="card-inner space-y-2"><div className="skeleton h-8 w-20" /><div className="skeleton h-3 w-16" /></div></div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return <div className="p-6 text-text-muted">No data</div>

  const { overview } = data
  const maxRevenue = data.monthlyRevenue.length > 0 ? Math.max(...data.monthlyRevenue.map((m) => m.total)) : 0

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Analytics</h1>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: `$${(overview.totalRevenue / 100).toLocaleString()}`, color: "text-accent-primary", delay: "stagger-1" },
          { label: "Completed", value: overview.completedProjects, color: "text-success", delay: "stagger-2" },
          { label: "Completion Rate", value: `${overview.completionRate}%`, color: "text-info", delay: "stagger-3" },
          { label: "Avg Value", value: `$${(overview.avgProjectValue / 100).toLocaleString()}`, color: "text-warning", delay: "stagger-4" },
        ].map((stat) => (
          <div key={stat.label} className={`card-double animate-fade-up ${stat.delay}`}>
            <div className="card-inner">
              <p className={`text-2xl font-bold ${stat.color} tabular-nums`} style={{ fontFamily: "var(--font-poppins)" }}>{stat.value}</p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-double animate-fade-up stagger-3">
          <div className="card-inner">
            <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-poppins)" }}>Project Status</h3>
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
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-medium tabular-nums">{item.count}</span>
                    </div>
                    <div className="h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="card-double animate-fade-up stagger-4">
          <div className="card-inner">
            <h3 className="font-semibold mb-4" style={{ fontFamily: "var(--font-poppins)" }}>Monthly Revenue</h3>
            {data.monthlyRevenue.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">No revenue data yet</p>
            ) : (
              <div className="space-y-2.5">
                {data.monthlyRevenue.slice(0, 6).map((r, i) => {
                  const pct = maxRevenue > 0 ? (r.total / maxRevenue) * 100 : 0
                  return (
                    <div key={r.month} className="animate-fade-up" style={{ animationDelay: `${100 + i * 60}ms` }}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-secondary">{r.month}</span>
                        <span className="font-medium tabular-nums">${(r.total / 100).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-bg-elevated rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-primary transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
