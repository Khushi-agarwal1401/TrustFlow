import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsClient: {
        include: { freelancer: true, client: true, milestones: { orderBy: { sequence: 'asc' } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      projectsAsFreelancer: {
        include: { freelancer: true, client: true, milestones: { orderBy: { sequence: 'asc' } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!user) redirect("/auth/signin")

  const allProjects = [...user.projectsAsClient, ...user.projectsAsFreelancer]
  const activeProjects = allProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING" || p.status === "AWAITING_ACCEPTANCE")
  
  // ── Real Escrow Data ──
  const escrowTransactions = await prisma.escrowTransaction.findMany({
    where: {
      milestone: { project: { OR: [{ clientId: user.id }, { freelancerId: user.id }] } },
      status: { in: ["PENDING", "SUCCEEDED"] },
    },
  })
  const escrowProtected = escrowTransactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFunded = escrowTransactions
    .filter((t) => t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + t.amount, 0)
  
  // ── AI Trust Score Computation ──
  const allMilestones = allProjects.flatMap(p => p.milestones)
  const completedMilestonesCount = allMilestones.filter(m => m.status === "APPROVED" || m.status === "PAID").length
  const totalMilestonesCount = allMilestones.length || 1
  const milestoneCompletionRate = Math.round((completedMilestonesCount / totalMilestonesCount) * 100)
  
  const ratings = await prisma.rating.findMany({
    where: { ratedUser: user.id },
    select: { score: true },
  })
  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    : null
  const ratingScore = avgRating ? (avgRating / 5) * 100 : 100
  
  const totalDisputes = await prisma.dispute.count({
    where: { milestone: { project: { OR: [{ clientId: user.id }, { freelancerId: user.id }] } } },
  })
  const disputeRate = allProjects.length > 0 ? (totalDisputes / allProjects.length) * 100 : 0
  const disputePenalty = Math.min(disputeRate * 10, 50)
  const aiTrustScore = Math.round(
    milestoneCompletionRate * 0.5 + ratingScore * 0.3 + (100 - disputePenalty) * 0.2
  )

  // ── Current Phase ──
  const currentProject = activeProjects[0] || null
  const currentPhase = currentProject ? {
    title: currentProject.title,
    status: currentProject.status,
    role: currentProject.clientId === user.id ? "client" : "freelancer",
    phase: currentProject.status === "DRAFT" ? "draft" : currentProject.status === "AWAITING_FUNDING" ? "funding" : "in_progress",
    nextAction: currentProject.status === "DRAFT" ? "Review & send to freelancer" : currentProject.status === "AWAITING_FUNDING" ? "Fund escrow to start" : "Track milestone progress",
  } : null

  // ── Widgets Data ──
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const upcomingMilestones = await prisma.milestone.findMany({
    where: {
      projectId: { in: activeProjects.map((p) => p.id) },
      status: "PENDING",
    },
    orderBy: { dueDate: "asc" },
    take: 2,
    include: { project: true },
  })

  const projectEvents = await prisma.projectEvent.findMany({
    where: { projectId: { in: allProjects.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { project: true, actor: true },
  })

  const riskSignals = await prisma.riskSignal.findMany({
    where: { projectId: { in: activeProjects.map(p => p.id) } },
    take: 1
  })
  const isHealthy = riskSignals.length === 0

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
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/></svg>
              Dashboard
            </Link>
            {['Projects', 'Contracts', 'Milestones', 'Escrow & Payments', 'Disputes', 'Messages', 'Analytics', 'Freelancers', 'Settings'].map(item => (
              <Link key={item} href={`/${item.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="flex items-center gap-3 px-3 py-2.5 text-[#64748B] hover:text-[#0F172A] hover:bg-gray-50 font-medium rounded-lg transition-colors">
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
               {user.avatarUrl ? <Image src={user.avatarUrl} alt="avatar" width={36} height={36} unoptimized className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{user.name}</p>
              <p className="text-xs text-[#64748B] capitalize">{user.roles?.[0]?.toLowerCase() || "User"}</p>
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
            <input type="text" placeholder="Search projects, freelancers, invoices..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
          </div>
          <div className="flex items-center gap-5 pl-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                 {user.avatarUrl ? <Image src={user.avatarUrl} alt="avatar" width={32} height={32} unoptimized className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
              </div>
              <span className="text-sm font-semibold text-[#0F172A] hidden md:block">{user.name?.split(' ')[0]}</span>
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col xl:flex-row max-w-[1600px] mx-auto p-8 gap-8">
            
            {/* LEFT 70% MAIN */}
            <div className="flex-1 flex flex-col gap-6">
              
              {/* Hero */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Welcome back, {user.name?.split(' ')[0]}! 👋</h1>
                  <p className="text-sm text-[#64748B]">Here&apos;s what&apos;s happening with your projects today.</p>
                </div>
                <Link href="/projects/new" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  + New Project
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </Link>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                    Escrow Protected
                  </div>
                  <div className="mt-auto">
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight">₹{escrowProtected.toLocaleString()}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-[#64748B]">Across {escrowTransactions.filter(t => t.status === 'PENDING').length || activeProjects.length} escrow{escrowTransactions.filter(t => t.status === 'PENDING').length !== 1 ? 's' : ''}</span>
                      <span className="text-xs font-bold text-[#10B981]">↑ {Math.round((totalFunded / Math.max(escrowProtected + totalFunded, 1)) * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg></div>
                    AI Trust Score
                  </div>
                  <div className="mt-auto">
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight">{aiTrustScore}%</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-bold ${aiTrustScore >= 80 ? 'text-[#10B981]' : aiTrustScore >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{aiTrustScore >= 80 ? 'Excellent' : aiTrustScore >= 50 ? 'Needs Review' : 'Critical'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                    Current Phase
                  </div>
                  <div className="mt-auto">
                    <div className="text-[18px] font-bold text-[#0F172A] tracking-tight truncate">{currentPhase?.title || "No active project"}</div>
                    <div className="text-xs text-[#64748B] mt-1 truncate">{currentPhase?.nextAction || "Create a project to get started"}</div>
                    {currentPhase && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${currentPhase.role === 'client' ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`}>{currentPhase.role === 'client' ? 'Client' : 'Freelancer'}</span>
                        <span className="text-[10px] text-[#64748B]">{currentPhase.status.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#4F46E5] h-full rounded-full transition-all duration-700" style={{ width: `${milestoneCompletionRate}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0F172A] mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                    Milestone Progress
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <div className="text-[28px] font-bold text-[#0F172A] tracking-tight">{completedMilestonesCount} / {totalMilestonesCount}</div>
                      <div className="text-xs text-[#64748B] mt-1">{milestoneCompletionRate}% completed</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                       <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-[#4F46E5]" strokeDasharray={`${milestoneCompletionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                       </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Project Health Banner */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }}></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">AI Project Health</h3>
                    {isHealthy ? (
                      <span className="bg-[#10B981]/10 text-[#10B981] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>Healthy</span>
                    ) : (
                      <span className="bg-[#F59E0B]/10 text-[#F59E0B] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>Risks Detected</span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748B] mb-6">{isHealthy ? "Everything looks good. No risk signals detected." : "AI has detected potential risks in your active projects."}</p>
                  <div className="flex flex-wrap gap-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A]">Contract</div>
                        <div className="text-[11px] text-[#64748B]">Accepted</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A]">Escrow</div>
                        <div className="text-[11px] text-[#64748B]">Funded</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A]">Milestone 1</div>
                        <div className="text-[11px] text-[#64748B]">Due in 4 days</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#0F172A]">Risk Signals</div>
                        <div className="text-[11px] text-[#64748B]">{riskSignals.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Projects List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[17px] font-bold text-[#0F172A] tracking-tight">Active Projects</h3>
                  <Link href="/projects" className="text-[#4F46E5] text-[13px] font-semibold hover:underline">View all projects</Link>
                </div>
                
                <div className="flex flex-col gap-4">
                  {activeProjects.map((project) => (
                    <div key={project.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-lg">{project.title.charAt(0)}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-[#0F172A]">{project.title}</h4>
                              <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-[10px] font-bold">{project.status === 'IN_PROGRESS' ? 'Active' : project.status.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="text-[11px] text-[#64748B] mt-0.5">By {project.client?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#0F172A]">₹{project.totalAmount.toLocaleString()}</div>
                          <p className="text-[11px] text-[#64748B]">Total Budget</p>
                        </div>
                      </div>

                      {/* Timeline Graphic */}
                      <div className="py-6 px-2 mb-4 relative">
                        <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 z-0"></div>
                        <div className="absolute top-1/2 left-0 h-[2px] bg-[#10B981] -translate-y-1/2 z-0" style={{ width: '40%' }}></div>
                        <div className="relative z-10 flex justify-between items-center w-full">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                            <span className="text-[10px] font-semibold text-[#0F172A]">Contract</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                            <span className="text-[10px] font-semibold text-[#0F172A]">Escrow</span>
                          </div>
                          {project.milestones.map((m, i) => (
                            <div key={m.id} className="flex flex-col items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-full border-2 ${m.status === 'PAID' ? 'bg-[#10B981] border-[#10B981] text-white' : m.status !== 'PENDING' ? 'bg-white border-[#4F46E5]' : 'bg-white border-gray-200'} flex items-center justify-center`}>
                                {m.status === 'PAID' ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> : <div className={`w-1.5 h-1.5 rounded-full ${m.status !== 'PENDING' ? 'bg-[#4F46E5]' : 'bg-gray-200'}`}></div>}
                              </div>
                              <span className="text-[10px] font-semibold text-[#0F172A]">Milestone {i + 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="grid grid-cols-4 gap-4 border-t border-gray-100 pt-4">
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-1">Freelancer</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                              {project.freelancer?.avatarUrl ? (
                                <Image src={project.freelancer.avatarUrl} alt="Freelancer avatar" width={20} height={20} unoptimized className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-[#4F46E5] flex items-center justify-center text-[10px] text-white font-bold">
                                  {project.freelancer?.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <span className="text-xs font-semibold text-[#0F172A]">{project.freelancer?.name || 'Unassigned'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-1">Due Date</p>
                          <p className="text-xs font-semibold text-[#0F172A]">{project.milestones[0]?.dueDate ? new Date(project.milestones[0].dueDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#64748B] mb-1">AI Match Score</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#0F172A]">91%</span>
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden"><div className="w-[91%] h-full bg-[#10B981]"></div></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center">
                          <Link href={`/projects/${project.id}`} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors">Review Now</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeProjects.length === 0 && <p className="text-sm text-gray-500">No active projects.</p>}
                </div>
              </div>
            </div>

            {/* RIGHT 30% WIDGETS */}
            <aside className="w-full xl:w-[340px] shrink-0 flex flex-col gap-8">
              
              {/* Notifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#0F172A] tracking-tight">Notifications</h3>
                  <Link href="/notifications" className="text-[#4F46E5] text-xs font-semibold hover:underline">View all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#0F172A] truncate">{notif.type}</h4>
                          <span className="text-[10px] text-[#64748B] shrink-0">10m ago</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{JSON.stringify(notif.payload)}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-xs text-gray-500">No new notifications.</p>}
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#0F172A] tracking-tight">Upcoming Milestones</h3>
                  <Link href="/milestones" className="text-[#4F46E5] text-xs font-semibold hover:underline">View all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {upcomingMilestones.map((m) => (
                    <div key={m.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-500 flex items-center justify-center shrink-0"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0F172A] truncate">{m.title}</h4>
                            <p className="text-[10px] text-[#64748B] mt-0.5">{m.project.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-[#64748B] mb-0.5">Due in</div>
                          <div className="text-xs font-bold text-[#F59E0B]">4 days</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[#0F172A]">₹{m.amount.toLocaleString()} <span className="text-[#64748B] font-normal">of ₹{m.project.totalAmount.toLocaleString()}</span></span>
                        <span className="text-[#64748B]">25%</span>
                      </div>
                      <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden"><div className="w-1/4 h-full bg-[#4F46E5]"></div></div>
                    </div>
                  ))}
                  {upcomingMilestones.length === 0 && <p className="text-xs text-gray-500">No upcoming milestones.</p>}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-[#0F172A] tracking-tight">Recent Activity</h3>
                  <Link href="/activity" className="text-[#4F46E5] text-xs font-semibold hover:underline">View all</Link>
                </div>
                <div className="flex flex-col gap-3">
                  {projectEvents.map((evt) => (
                    <div key={evt.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 text-gray-500"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#0F172A] truncate">{evt.eventType.replace(/_/g, ' ')}</h4>
                          <span className="text-[10px] text-[#64748B] shrink-0">1h ago</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate">{evt.project.title}</p>
                      </div>
                    </div>
                  ))}
                  {projectEvents.length === 0 && <p className="text-xs text-gray-500">No recent activity.</p>}
                </div>
              </div>

            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
