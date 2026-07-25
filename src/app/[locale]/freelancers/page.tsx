import Link from "next/link"

export default function FreelancersPage() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-[#EEF2FF] text-[#4F46E5] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Freelancers</h1>
        <p className="text-[#64748B] mb-6">Manage and discover freelance talent. Coming soon.</p>
        <Link href="/" className="px-5 py-2.5 bg-[#4F46E5] text-white font-medium rounded-lg hover:bg-[#4338CA] transition-colors">
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
