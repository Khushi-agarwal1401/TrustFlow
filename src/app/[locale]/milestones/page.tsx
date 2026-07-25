import Link from "next/link"

export default function MilestonesPage() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Milestones</h1>
        <p className="text-[#64748B] mb-6">Track and manage project milestones. Coming soon.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
