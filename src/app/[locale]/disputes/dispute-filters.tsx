"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface DisputeFiltersProps {
  projectOptions: { value: string; label: string }[]
}

export function DisputeFilters({ projectOptions }: DisputeFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get("status") || ""
  const currentProject = searchParams.get("project") || ""
  const currentDateRange = searchParams.get("dateRange") || ""

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.delete("page")
    router.push(`/disputes?${params.toString()}`)
  }

  const hasFilters = currentStatus || currentProject || currentDateRange

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between bg-white">
      <div className="relative w-72 shrink-0">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          onChange={(e) => updateParam("q", e.target.value)}
          defaultValue={searchParams.get("q") || ""}
          placeholder="Search disputes by milestone or project..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white"
        />
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Status</span>
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
            style={{
              backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">All Status</option>
            <option value="EVIDENCE_PENDING">Awaiting Response</option>
            <option value="AI_SUGGESTED">In Progress</option>
            <option value="RESOLVED_ACCEPTED">Resolved</option>
            <option value="RESOLVED_ADMIN">Resolved (Admin)</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Project</span>
          <select
            value={currentProject}
            onChange={(e) => updateParam("project", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
            style={{
              backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">All Projects</option>
            {projectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Date Range</span>
          <select
            value={currentDateRange}
            onChange={(e) => updateParam("dateRange", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
            style={{
              backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">This Year</option>
          </select>
        </div>

        {hasFilters && (
          <div className="flex flex-col h-full justify-end pt-[20px]">
            <button
              onClick={() => router.push("/disputes")}
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold transition-colors text-red-500"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
