import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { FreelancerFilters } from "./freelancer-filters"
import { ExportButton } from "./freelancer-export"
import { FreelancerPagination } from "./freelancer-pagination"

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function FreelancersPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/auth/signin")

  const sp = await searchParams
  const query = ((sp.q as string) || "").toLowerCase()
  const statusFilter = (sp.status as string) || ""
  const skillFilter = (sp.skill as string) || ""
  const sortBy = (sp.sort as string) || "name"
  const currentPage = Math.max(1, parseInt((sp.page as string) || "1", 10))
  const PER_PAGE = 10

  // Fetch all projects where user is client, including freelancer and their details
  const projects = await prisma.project.findMany({
    where: { clientId: session.user.id },
    include: {
      freelancer: {
        include: {
          freelancerProfile: true,
        }
      },
      milestones: {
        include: {
          submissions: { take: 1, orderBy: { submittedAt: "desc" } },
        },
      },
      ratings: true,
      projectEvents: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    }
  })

  // We need to aggregate by freelancer
  // A freelancer might be on multiple projects for this client
  const freelancerMap = new Map<string, any>()

  projects.forEach(p => {
    if (!p.freelancer) return

    const flId = p.freelancer.id
    if (!freelancerMap.has(flId)) {
      freelancerMap.set(flId, {
        freelancer: p.freelancer,
        projects: [],
        milestones: [],
        ratingsReceived: [],
      })
    }

    const flData = freelancerMap.get(flId)
    flData.projects.push(p)
    flData.milestones.push(...p.milestones)
    
    // Get ratings given by this client to this freelancer on this project
    const relevantRatings = p.ratings.filter(r => r.ratedUser === flId && r.ratedBy === session.user?.id)
    flData.ratingsReceived.push(...relevantRatings)
  })

  // Format the aggregated data
  let totalPaidOverall = 0
  let totalProjectsOverall = projects.length
  let totalCompletedProjectsOverall = projects.filter(p => p.status === 'COMPLETED').length
  let totalActiveFreelancers = 0
  let totalAvailableFreelancers = 0
  let totalOnHoldFreelancers = 0
  let totalInactiveFreelancers = 0
  let allRatings: number[] = []
  
  const skillCounts = new Map<string, number>()

  const formattedFreelancers = Array.from(freelancerMap.values()).map(data => {
    const { freelancer, projects, milestones, ratingsReceived } = data
    
    // Determine active projects
    const activeProjects = projects.filter((p: any) => p.status === 'IN_PROGRESS' || p.status === 'AWAITING_FUNDING')
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED')
    
    // Earnings from paid milestones (only RELEASED payments)
    const paidMilestones = milestones.filter((m: any) => m.status === 'PAID')
    const totalEarned = paidMilestones.reduce((sum: number, m: any) => sum + m.amount, 0)
    totalPaidOverall += totalEarned

    // Completion Rate (Completed milestones / Total milestones)
    const completedMilestones = milestones.filter((m: any) => m.status === 'APPROVED' || m.status === 'PAID')
    const completionRate = milestones.length > 0 ? Math.round((completedMilestones.length / milestones.length) * 100) : null

    // On-time delivery rate
    const onTimeMilestones = completedMilestones.filter((m: any) => m.dueDate && m.submissions?.[0]?.submittedAt <= m.dueDate)
    const onTimeRate = completedMilestones.length > 0
      ? Math.round((onTimeMilestones.length / completedMilestones.length) * 100)
      : null

    // Rating
    const avgRating = ratingsReceived.length > 0 
      ? ratingsReceived.reduce((sum: number, r: any) => sum + r.score, 0) / ratingsReceived.length 
      : null
    if (avgRating !== null && avgRating > 0) allRatings.push(avgRating)

    // Status
    let status = 'Available'
    if (activeProjects.length > 0) status = 'Active'
    else if (projects.length > 0 && projects.every((p: any) => p.status === 'CANCELLED')) status = 'Inactive'
    
    if (status === 'Active') totalActiveFreelancers++
    else if (status === 'Available') totalAvailableFreelancers++
    else if (status === 'Inactive') totalInactiveFreelancers++
    else totalOnHoldFreelancers++

    // Skills
    const skills = freelancer.freelancerProfile?.skills || []
    skills.forEach((s: string) => {
      skillCounts.set(s, (skillCounts.get(s) || 0) + 1)
    })

    // Location
    const profile = freelancer.freelancerProfile
    const location = [profile?.city, profile?.country].filter(Boolean).join(", ")

    // Latest activity
    const lastEvent = projects[0]?.projectEvents?.[0]

    return {
      id: freelancer.id,
      name: freelancer.name,
      email: freelancer.email,
      avatarUrl: freelancer.avatarUrl,
      skills,
      projectCount: projects.length,
      activeProjectCount: activeProjects.length,
      completionRate,
      onTimeRate,
      totalEarned,
      rating: avgRating,
      status,
      location,
      lastEvent,
    }
  })

  // Apply search filter
  let filtered = formattedFreelancers.filter((fl: any) => {
    if (query && !fl.name.toLowerCase().includes(query) && !fl.email.toLowerCase().includes(query) && !fl.skills.some((s: string) => s.toLowerCase().includes(query))) {
      return false
    }
    if (statusFilter && fl.status !== statusFilter) return false
    if (skillFilter && !fl.skills.includes(skillFilter)) return false
    return true
  })

  // Apply sorting
  filtered.sort((a: any, b: any) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "earned":
        return b.totalEarned - a.totalEarned
      case "projects":
        return b.projectCount - a.projectCount
      case "recent":
        return 0 // Keep original order (most recent from DB)
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Paginate
  const totalFiltered = filtered.length
  const totalPages = Math.ceil(totalFiltered / PER_PAGE)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const paginatedFreelancers = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  // KPI Calculations (from filtered list)
  const totalFreelancers = filtered.length
  const avgOverallRating = allRatings.length > 0 
    ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) 
    : '0.0'

  // Insight Chart Math
  const divisor = totalFreelancers || 1
  const activePct = Math.round((totalActiveFreelancers / divisor) * 100)
  const availablePct = Math.round((totalAvailableFreelancers / divisor) * 100)
  const onHoldPct = Math.round((totalOnHoldFreelancers / divisor) * 100)
  const inactivePct = Math.round((totalInactiveFreelancers / divisor) * 100)

  // Top Skills sorted
  const topSkills = Array.from(skillCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* LEFT SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col justify-between hidden lg:flex shrink-0 h-screen overflow-y-auto">
        <div>
          <div className="h-[72px] flex items-center px-6 border-b border-transparent">
            <div className="flex items-center gap-2.5 text-[#4F46E5]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span className="font-bold text-xl tracking-tight text-[#0F172A]">TrustFlow</span>
            </div>
          </div>
          <nav className="px-4 py-6 flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
              Dashboard
            </Link>
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Projects
            </Link>
            <Link href="/contracts" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Contracts
            </Link>
            <Link href="/milestones" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Milestones
            </Link>
            <Link href="/escrow-payments" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Escrow & Payments
            </Link>
            <Link href="/disputes" className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
              Disputes
            </Link>
            <Link href="/freelancers" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Freelancers
            </Link>
            {['Messages', 'Analytics', 'Reports', 'Settings'].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
                <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50"></div>
                {item}
                {item === 'Messages' && <span className="ml-auto bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>}
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <div className="bg-[#EEF2FF] rounded-xl p-5 mb-4 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5 mb-1">
                <svg width="14" height="14" fill="currentColor" className="text-[#4F46E5]" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Upgrade to Pro
              </h4>
              <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">Unlock advanced analytics, priority support and more.</p>
              <button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-sm">Upgrade Now</button>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
               {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{user.name}</p>
              <p className="text-xs text-[#64748B] capitalize">{user.roles?.[0]?.toLowerCase() || "Client"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 max-w-xl relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search projects, freelancers, invoices..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
          </div>
          <div className="flex items-center gap-5 pl-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                 {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
              </div>
              <span className="text-sm font-semibold text-[#0F172A] hidden md:block">{user.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-8">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Freelancers</h1>
                <p className="text-sm text-[#64748B]">Manage and collaborate with freelancers across all your projects.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/projects" className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
                  Invite Freelancer
                </Link>
                <Link href="/projects/new" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Create Project
                </Link>
              </div>
            </div>

            {/* Top Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Freelancers</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{totalFreelancers}</div>
                <div className="text-[11px] text-[#64748B] mb-0">Across all projects</div>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Active Freelancers</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{totalActiveFreelancers}</div>
                <div className="text-[11px] text-[#64748B] mb-0">Working on projects</div>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Completed Projects</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{totalCompletedProjectsOverall}</div>
                <div className="text-[11px] text-[#64748B] mb-0">By your freelancers</div>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Paid</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">${(totalPaidOverall / 100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-0">Across all freelancers</div>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Avg. Rating</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{avgOverallRating}<span className="text-sm font-medium text-gray-400">/5</span></div>
                <div className="text-[11px] text-[#64748B] mb-0">From {allRatings.length} reviews</div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN: Freelancers Table */}
              <div className="lg:w-[70%] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Search & Filters */}
                <div className="p-5 border-b border-gray-100 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <FreelancerFilters />
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end px-6 py-2 bg-white border-b border-gray-100">
                  <ExportButton data={paginatedFreelancers} />
                </div>

                {/* Table Header */}
                <div className="bg-[#F8FAFC] border-b border-gray-100 flex items-center px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <div className="w-[30%]">Freelancer</div>
                  <div className="w-[18%]">Skills</div>
                  <div className="w-[10%]">Projects</div>
                  <div className="w-[12%]">On-time Delivery</div>
                  <div className="w-[12%]">Total Earned</div>
                  <div className="w-[8%]">Rating</div>
                  <div className="w-[5%]">Status</div>
                  <div className="w-[5%] text-right ml-auto">Actions</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 bg-white">
                  {paginatedFreelancers.length > 0 ? paginatedFreelancers.map((fl: any) => {
                    const displayRate = fl.onTimeRate !== null ? fl.onTimeRate : fl.completionRate
                    const rateLabel = fl.onTimeRate !== null ? "On Time" : "Completed"
                    return (
                      <div key={fl.id} className="flex items-center px-6 py-5 hover:bg-gray-50 transition-colors">
                        {/* Freelancer */}
                        <div className="w-[30%] flex items-center gap-3 pr-4">
                          <Link href={`/freelancers/${fl.id}`} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 relative hover:opacity-80 transition-opacity">
                             {fl.avatarUrl ? <img src={fl.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                          </Link>
                          <div>
                            <Link href={`/freelancers/${fl.id}`} className="text-[13px] font-bold text-[#0F172A] mb-0.5 flex items-center gap-1 hover:text-[#4F46E5] transition-colors">
                              {fl.name}
                              {fl.onTimeRate !== null && fl.onTimeRate >= 80 && (
                                <svg width="14" height="14" fill="#10B981" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                              )}
                            </Link>
                            <div className="text-[11px] text-[#64748B] mb-0.5">{fl.email}</div>
                            {fl.location && (
                              <div className="text-[10px] text-[#94A3B8] flex items-center gap-1">
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                {fl.location}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Skills */}
                        <div className="w-[18%] pr-4 flex flex-wrap gap-1.5 items-center">
                          {fl.skills.slice(0, 2).map((skill: string, idx: number) => (
                            <span key={idx} className="bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap">
                              {skill}
                            </span>
                          ))}
                          {fl.skills.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                              +{fl.skills.length - 2}
                            </span>
                          )}
                          {fl.skills.length === 0 && (
                            <span className="text-[11px] text-gray-400 italic">No skills listed</span>
                          )}
                        </div>

                        {/* Projects */}
                        <div className="w-[10%] pr-4">
                           <div className="text-[13px] font-bold text-[#0F172A] mb-0.5">{fl.projectCount}</div>
                           <div className="text-[10px] text-[#10B981] font-bold">{fl.activeProjectCount} Active</div>
                        </div>

                        {/* On-time Delivery Rate */}
                        <div className="w-[12%] pr-4 flex items-center gap-2">
                          {displayRate !== null ? (
                            <>
                              <div className="relative w-8 h-8 shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                  <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="4"></circle>
                                  <circle cx="18" cy="18" r="16" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${displayRate} 100`}></circle>
                                </svg>
                              </div>
                              <div>
                                <div className="text-[12px] font-bold text-[#0F172A]">{displayRate}%</div>
                                <div className="text-[9px] text-[#64748B]">{rateLabel}</div>
                              </div>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 italic">Not enough data</span>
                          )}
                        </div>

                        {/* Total Earned */}
                        <div className="w-[12%] pr-4">
                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">${(fl.totalEarned / 100).toLocaleString()}</div>
                          <div className="text-[10px] text-[#64748B]">Earned</div>
                        </div>

                        {/* Rating */}
                        <div className="w-[8%] pr-4">
                          <div className="text-[13px] font-bold text-[#0F172A] mb-0.5">{fl.rating ? fl.rating.toFixed(1) : '—'}</div>
                          <div className="flex gap-0.5 text-[#F59E0B]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} width="8" height="8" fill={fl.rating && star <= fl.rating ? "currentColor" : "#E2E8F0"} viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="w-[5%]">
                          <span className={`text-[11px] font-bold ${fl.status === 'Active' ? 'text-[#10B981]' : fl.status === 'Available' ? 'text-[#3B82F6]' : 'text-gray-500'}`}>
                            {fl.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="w-[5%] flex items-center justify-end gap-2 ml-auto">
                          <Link href={`/freelancers/${fl.id}`} className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-[#0F172A] hover:bg-gray-50 whitespace-nowrap hover:border-[#4F46E5] transition-colors">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-gray-500 font-medium">No freelancers found</p>
                      <p className="text-xs text-gray-400 mt-1">Invite someone to a project to get started!</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <FreelancerPagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={totalFiltered}
                />

              </div>

              {/* RIGHT COLUMN: Sidebar Widgets */}
              <div className="lg:w-[30%] flex flex-col gap-6">
                
                {/* Freelancer Insights Donut */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Freelancer Insights</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View Report <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative w-[110px] h-[110px] shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F1F5F9" strokeWidth="3"></circle>
                        {/* Gray Inactive */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray={`${inactivePct} 100`} strokeDashoffset="0"></circle>
                        {/* Orange On Hold */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${onHoldPct} 100`} strokeDashoffset={`-${inactivePct}`}></circle>
                        {/* Blue Available */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${availablePct} 100`} strokeDashoffset={`-${inactivePct + onHoldPct}`}></circle>
                        {/* Green Active */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${activePct} 100`} strokeDashoffset={`-${inactivePct + onHoldPct + availablePct}`}></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[20px] font-bold text-[#0F172A] leading-none mb-1">{totalFreelancers}</span>
                        <span className="text-[10px] text-[#64748B] font-medium">Total</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span><span className="text-[#0F172A] font-medium">Active</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{totalActiveFreelancers}</span><span className="text-[9px] text-[#64748B]">({activePct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span><span className="text-[#0F172A] font-medium">Available</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{totalAvailableFreelancers}</span><span className="text-[9px] text-[#64748B]">({availablePct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span><span className="text-[#0F172A] font-medium">On Hold</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{totalOnHoldFreelancers}</span><span className="text-[9px] text-[#64748B]">({onHoldPct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span><span className="text-[#0F172A] font-medium">Inactive</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{totalInactiveFreelancers}</span><span className="text-[9px] text-[#64748B]">({inactivePct}%)</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Skills */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Top Skills</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline">View all</button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {topSkills.length > 0 ? topSkills.map(([skill, count], i) => (
                      <div key={skill}>
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="font-bold text-[#0F172A]">{skill}</span>
                          <span className="text-[#64748B]">{count} freelancers</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#4F46E5] rounded-full" style={{ width: `${Math.min((count / totalFreelancers) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-[11px] text-gray-500 italic">No skills added by your freelancers yet.</div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Recent Activity</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline">View all</button>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    {paginatedFreelancers.slice(0, 4).map((fl: any) => {
                      const lastEvent = fl.lastEvent
                      const eventDesc = lastEvent ? lastEvent.eventType?.replace(/_/g, ' ').toLowerCase() : 'joined a project'
                      const eventTime = lastEvent ? formatTimeAgo(new Date(lastEvent.createdAt)) : null
                      return (
                        <div key={fl.id} className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden shrink-0 mt-0.5">
                            {fl.avatarUrl ? <img src={fl.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                          </div>
                          <div>
                            <div className="text-[12px] text-[#0F172A] leading-snug">
                              <span className="font-bold">{fl.name}</span> {eventDesc}
                            </div>
                            {eventTime && (
                              <div className="text-[10px] text-[#64748B] mt-0.5">{eventTime}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    {paginatedFreelancers.length === 0 && (
                      <div className="text-[11px] text-gray-500 italic">No recent activity.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
