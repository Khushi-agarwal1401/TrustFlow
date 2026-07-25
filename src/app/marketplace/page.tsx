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
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Marketplace</h1>
          <p className="text-text-secondary text-sm">Browse public projects and submit proposals</p>
        </div>
        <Link href="/" className="btn-ghost text-sm">&larr; Dashboard</Link>
      </div>

      <input
        className="input mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
      />

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No public projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{project.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span>Posted by {project.client.name}</span>
                    <span>${(project.totalAmount / 100).toLocaleString()}</span>
                    <span>{project._count.proposals} proposals</span>
                  </div>
                </div>
                {session?.user?.id !== project.client.id && (
                  <Link href={`/projects/${project.id}/proposals`} className="btn-primary text-sm ml-4 whitespace-nowrap">
                    Submit Proposal
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
