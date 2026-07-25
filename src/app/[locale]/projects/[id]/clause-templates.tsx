"use client"

import { useState, useEffect } from "react"

interface ClauseTemplate {
  id: string
  name: string
  description: string | null
  jurisdiction: string
  category: string
  content: string
}

export function ClauseTemplates() {
  const [templates, setTemplates] = useState<ClauseTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<ClauseTemplate | null>(null)

  useEffect(() => {
    if (!expanded) return
    if (templates.length > 0) return
    fetch("/api/clause-templates")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [expanded, templates.length])

  const categories = [...new Set(templates.map((t) => t.category))]

  return (
    <div>
      <button
        onClick={() => {
          if (!expanded && templates.length === 0) setLoading(true)
          setExpanded(!expanded)
        }}
        className="btn-ghost w-full text-sm"
      >
        {expanded ? "Hide Clause Templates" : "Browse Clause Templates"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-4">
              <div className="skeleton h-4 w-32 mx-auto" />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No clause templates available</p>
          ) : (
            categories.map((cat) => (
              <div key={cat}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5">{cat}</p>
                <div className="space-y-1.5">
                  {templates.filter((t) => t.category === cat).map((t) => (
                    <div key={t.id}>
                      <button
                        onClick={() => setSelected(selected?.id === t.id ? null : t)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors ${
                          selected?.id === t.id
                            ? "bg-accent-subtle border border-accent-primary/30"
                            : "bg-bg-elevated hover:bg-bg-hover border border-transparent"
                        }`}
                      >
                        <p className="font-medium text-text-primary">{t.name}</p>
                        {t.description && (
                          <p className="text-text-muted mt-0.5 leading-relaxed">{t.description}</p>
                        )}
                        <span className="text-[10px] text-text-muted mt-1 block">
                          {t.jurisdiction} jurisdiction
                        </span>
                      </button>
                      {selected?.id === t.id && (
                        <div className="mt-2 p-3 bg-bg-base rounded-lg border border-border-subtle">
                          <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap font-mono">
                            {t.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
