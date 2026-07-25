"use client"

import { useState } from "react"

interface FreelancerRow {
  id: string
  name: string
  email: string
  skills: string[]
  projectCount: number
  activeProjectCount: number
  completionRate: number | null
  onTimeRate: number | null
  totalEarned: number
  rating: number | null
  status: string
}

export function ExportButton({ data }: { data: FreelancerRow[] }) {
  const [open, setOpen] = useState(false)

  function toCSV(rows: FreelancerRow[]): string {
    const header = "Name,Email,Skills,Projects,On-time Rate,Total Earned,Rating,Status"
    const lines = rows.map((r) =>
      [
        `"${r.name}"`,
        `"${r.email}"`,
        `"${r.skills.join("; ")}"`,
        r.projectCount,
        r.onTimeRate !== null ? `${r.onTimeRate}%` : "N/A",
        `$${r.totalEarned}`,
        r.rating !== null ? r.rating.toFixed(1) : "N/A",
        `"${r.status}"`,
      ].join(",")
    )
    return [header, ...lines].join("\n")
  }

  function download(content: string, mime: string, ext: string) {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `freelancers.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  if (data.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
            <button
              onClick={() => download(toCSV(data), "text/csv", "csv")}
              className="w-full text-left px-4 py-2 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
            >
              Export as CSV
            </button>
            <button
              onClick={() => download(JSON.stringify(data, null, 2), "application/json", "json")}
              className="w-full text-left px-4 py-2 text-sm text-[#0F172A] hover:bg-gray-50 transition-colors"
            >
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  )
}
