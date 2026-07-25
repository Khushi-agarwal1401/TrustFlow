import Link from "next/link"

export default function ContractsPage() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Contracts</h1>
        <p className="text-[#64748B] mb-6">Manage all your smart contracts in one place. Coming soon.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
