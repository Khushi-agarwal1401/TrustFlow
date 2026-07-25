"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useRef, useEffect, useState } from "react"

export function ProjectFilters({ totalProjects }: { totalProjects: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 when filters change
      if (key !== "page") params.delete("page")
      router.push(`/projects?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (searchParams.get("q") || "")) {
        updateParam("q", searchValue)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchValue, updateParam, searchParams])

  const currentStatus = searchParams.get("status") || ""
  const currentHealth = searchParams.get("health") || ""
  const currentSort = searchParams.get("sort") || "latest"

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search projects by name or freelancer..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all"
        />
        {searchValue && (
          <button
            onClick={() => {
              setSearchValue("")
              updateParam("q", "")
              searchRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Status</span>
          <select
            value={currentStatus}
            onChange={(e) => updateParam("status", e.target.value)}
            className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            <option value="">All Statuses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AWAITING_FUNDING">Awaiting Funding</option>
            <option value="AWAITING_ACCEPTANCE">Awaiting Acceptance</option>
            <option value="COMPLETED">Completed</option>
            <option value="DRAFT">Draft</option>
            <option value="DISPUTED">Disputed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Health</span>
          <select
            value={currentHealth}
            onChange={(e) => updateParam("health", e.target.value)}
            className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            <option value="">All Health</option>
            <option value="healthy">Healthy</option>
            <option value="at_risk">At Risk</option>
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Sort by</span>
          <select
            value={currentSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.5em 1.5em",
            }}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="budget_high">Budget: High to Low</option>
            <option value="budget_low">Budget: Low to High</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        <div className="h-full flex items-end">
          <button
            onClick={() => {
              const params = new URLSearchParams()
              router.push("/projects")
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-[#0F172A] hover:bg-gray-50 flex items-center gap-2 transition-colors h-[34px]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {searchParams.toString() ? "Clear Filters" : "Filters"}
          </button>
        </div>
      </div>
    </div>
  )
}
