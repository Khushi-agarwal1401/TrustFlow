"use client"

import { useState, useEffect } from "react"

interface Delivery {
  id: string
  event: string
  status: string
  responseCode: number | null
  responseBody: string | null
  createdAt: string
}

export function IntegrationDeliveries({ integrationId }: { integrationId: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!expanded) return
    if (deliveries.length > 0) return
    fetch(`/api/integrations/${integrationId}/deliveries`)
      .then((r) => r.json())
      .then((data) => {
        setDeliveries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [integrationId, expanded, deliveries.length])

  return (
    <div>
      <button
        onClick={() => {
          if (!expanded && deliveries.length === 0) setLoading(true)
          setExpanded(!expanded)
        }}
        className="text-xs text-accent-primary hover:underline transition"
      >
        {expanded ? "Hide Deliveries" : `View Deliveries (${deliveries.length})`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
          {loading ? (
            <div className="text-center py-3">
              <div className="skeleton h-4 w-24 mx-auto" />
            </div>
          ) : deliveries.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-3">No deliveries yet</p>
          ) : (
            deliveries.map((d) => (
              <div
                key={d.id}
                className={`p-2.5 rounded-lg text-xs border ${
                  d.status === "SUCCESS"
                    ? "bg-success/5 border-success/20"
                    : d.status === "FAILED"
                    ? "bg-danger/5 border-danger/20"
                    : "bg-bg-elevated border-border-subtle"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      d.status === "SUCCESS" ? "bg-success" : d.status === "FAILED" ? "bg-danger" : "bg-text-muted"
                    }`} />
                    <span className="font-medium text-text-primary">{d.event}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.responseCode && (
                      <span className="text-text-muted">{d.responseCode}</span>
                    )}
                    <span className="text-text-muted">{new Date(d.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <span className={`badge text-[10px] ${
                  d.status === "SUCCESS" ? "bg-success/10 text-success" :
                  d.status === "FAILED" ? "bg-danger/10 text-danger" :
                  "bg-text-muted/10 text-text-muted"
                }`}>{d.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
