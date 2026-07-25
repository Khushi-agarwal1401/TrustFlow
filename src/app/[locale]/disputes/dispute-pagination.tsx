"use client"

import { useRouter, useSearchParams } from "next/navigation"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
}

export function DisputePagination({ currentPage, totalPages, totalItems }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    router.push(`/disputes?${params.toString()}`)
  }

  if (totalPages <= 1 && totalItems <= 10) return null

  const startItem = (currentPage - 1) * 10 + 1
  const endItem = Math.min(currentPage * 10, totalItems)

  // Build page numbers with ellipsis
  const pages: (number | "...")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push("...")
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push("...")
    pages.push(totalPages)
  }

  return (
    <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between text-[13px] text-[#64748B]">
      <div>
        Showing {startItem} to {endItem} of {totalItems} disputes
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                p === currentPage
                  ? "border border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5]"
                  : "border border-gray-200 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
