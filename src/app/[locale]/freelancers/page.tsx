import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, Briefcase, Star, Search, Clock } from "lucide-react"

export default async function FreelancersPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  // In a real marketplace, you'd add pagination and filtering logic here
  const freelancers = await prisma.freelancerProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true, createdAt: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 font-sans">
      <header className="bg-white border border-gray-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition">&larr; Dashboard</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-lg font-bold text-gray-900">Freelancer Directory</h1>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-[#4F46E5]" />
          <span className="text-sm font-semibold text-gray-600">Discover Talent</span>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by skills, name, or role..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all shadow-sm"
          />
        </div>
        <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          Filters
        </button>
      </div>

      {/* Freelancers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500 shadow-sm">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No freelancer profiles found.</p>
          </div>
        ) : (
          freelancers.map((profile) => (
            <div key={profile.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {profile.user.avatarUrl ? <img src={profile.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-bold">{profile.user.name[0]}</div>}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{profile.user.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{profile.title || "Freelancer"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-md text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    4.9
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {profile.bio || "This freelancer hasn't added a bio yet."}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {profile.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded text-[11px] font-medium">
                      +{profile.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> ${profile.hourlyRate || 0}/hr</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {profile.availability || "Open to work"}</span>
                </div>
                <button className="px-4 py-2 bg-[#4F46E5] text-white text-xs font-semibold rounded-lg hover:bg-[#4338CA] transition-colors shadow-sm">
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
