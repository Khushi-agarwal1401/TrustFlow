"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function FreelancerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== "page") params.delete("page")
      router.push(`/freelancers?${params.toString()}`)
    },
    [router, searchParams]
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const current = searchParams.get("q") || ""
      if (searchValue !== current) {
        updateParam("q", searchValue)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchValue, updateParam, searchParams])

  const currentStatus = searchParams.get("status") || ""
  const currentSkill = searchParams.get("skill") || ""
  const currentSort = searchParams.get("sort") || "name"

  const hasFilters = currentStatus || currentSkill || currentSort !== "name" || searchValue

  return (
    <div className="flex flex-wrap gap-4 items-center justify-between bg-white">
      <div className="relative w-72 shrink-0">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search freelancers by name, skills or email..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white"
        />
      </div>

      <div className="flex items-center gap-3 flex-1 justify-end">
        <select
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Available">Available</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={currentSkill}
          onChange={(e) => updateParam("skill", e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          <option value="">All Skills</option>
          <option value="React">React</option>
          <option value="Node.js">Node.js</option>
          <option value="Python">Python</option>
          <option value="TypeScript">TypeScript</option>
          <option value="UI/UX">UI/UX</option>
          <option value="JavaScript">JavaScript</option>
        </select>

        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8"
          style={{
            backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
          }}
        >
          <option value="name">Name</option>
          <option value="rating">Rating</option>
          <option value="earned">Total Earned</option>
          <option value="projects">Projects</option>
          <option value="recent">Recent</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => router.push("/freelancers")}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold transition-colors text-red-500"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
