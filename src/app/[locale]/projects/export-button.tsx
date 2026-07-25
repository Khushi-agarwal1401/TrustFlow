"use client"

import { useState } from "react"

interface ProjectRow {
  title: string
  status: string
  health: string
  freelancerName: string
  currentMilestone: string
  progressPct: number
  completedMilestones: number
  totalMilestones: number
  budget: number
  escrowStatus: string
  dueDate: string
}

export function ExportButton({ projects }: { projects: ProjectRow[] }) {
  const [open, setOpen] = useState(false)

  function toCSV(rows: ProjectRow[]): string {
    const headers = [
      "Project",
      "Status",
      "Health",
      "Freelancer",
      "Current Milestone",
      "Progress",
      "Milestones",
      "Budget",
      "Escrow",
      "Due Date",
    ]
    const csvRows = [headers.join(",")]
    for (const p of rows) {
      csvRows.push(
        [
          `"${p.title.replace(/"/g, '""')}"`,
          p.status,
          p.health,
          `"${p.freelancerName.replace(/"/g, '""')}"`,
          `"${p.currentMilestone.replace(/"/g, '""')}"`,
          `${p.progressPct}%`,
          `${p.completedMilestones}/${p.totalMilestones}`,
          `$${(p.budget / 100).toLocaleString()}`,
          p.escrowStatus,
          p.dueDate,
        ].join(",")
      )
    }
    return csvRows.join("\n")
  }

  function download(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

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
          <div className="absolute right-0 top-full mt-2 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
            <button
              onClick={() => {
                download(toCSV(projects), "projects.csv", "text/csv")
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#0F172A] hover:bg-gray-50 flex items-center gap-2.5"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as CSV
            </button>
            <button
              onClick={() => {
                download(JSON.stringify(projects, null, 2), "projects.json", "application/json")
                setOpen(false)
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#0F172A] hover:bg-gray-50 flex items-center gap-2.5"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as JSON
            </button>
          </div>
        </>
      )}
    </div>
  )
}
