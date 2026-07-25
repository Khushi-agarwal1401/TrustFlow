import Link from "next/link"

export default function EscrowPaymentsPage() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Escrow & Payments</h1>
        <p className="text-[#64748B] mb-6">Manage your protected funds and payments. Coming soon.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
