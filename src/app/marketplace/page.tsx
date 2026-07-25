"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface ListedProject {
  id: string
  title: string
  description: string
  totalAmount: number
  currency: string
  client: { id: string; name: string; avatarUrl: string | null }
  _count: { proposals: number }
  listedAt: string
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<ListedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    fetch(`/api/marketplace/projects?${params}`)
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false) })
  }, [query])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Marketplace</h1>
        </div>
        <p className="text-text-secondary text-sm hidden sm:block">Find your next project</p>
      </header>

      <div className="relative mb-8 animate-fade-up stagger-1">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          className="input pl-11"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by title, description..."
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-double animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="card-inner space-y-3">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-1/2" />
                <div className="flex gap-2 mt-2">
                  <div className="skeleton h-8 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="card-double animate-fade-up stagger-2">
          <div className="card-inner text-center py-16">
            <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <p className="text-text-muted">No public projects found</p>
            <p className="text-text-muted text-sm mt-1">{query ? "Try a different search term" : "Check back later for new opportunities"}</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project, i) => (
            <div key={project.id} className={`card-double transition-all duration-200 hover:border-accent-primary/30 animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="card-inner">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-text-primary" style={{ fontFamily: "var(--font-poppins)" }}>{project.title}</h3>
                  <span className="badge bg-bg-elevated text-text-secondary whitespace-nowrap ml-3">
                    ${(project.totalAmount / 100).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">{project.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span>by {project.client.name}</span>
                    <span className="w-1 h-1 rounded-full bg-border-subtle" />
                    <span>{project._count.proposals} proposal{project._count.proposals !== 1 ? "s" : ""}</span>
                  </div>
                  {session?.user?.id !== project.client.id && (
                    <Link
                      href={`/projects/${project.id}/proposals`}
                      className="btn-primary text-sm"
                    >
                      Submit Proposal
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
