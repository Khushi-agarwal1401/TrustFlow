import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function MilestonesPage({ searchParams }: { searchParams: { projectId?: string; status?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  // Find the target project or the most recently active one
  let projectQuery: any = { OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }] }
  if (searchParams.projectId) {
    projectQuery = { id: searchParams.projectId, ...projectQuery }
  }

  const project = await prisma.project.findFirst({
    where: projectQuery,
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      freelancer: true,
      milestones: {
        orderBy: { sequence: "asc" },
        include: {
          submissions: {
            orderBy: { submittedAt: "desc" },
            include: { aiReview: true },
          }
        }
      }
    }
  })

  const user = await prisma.user.findUnique({ where: { id: session.user.id }})
  if (!user) redirect("/auth/signin")

  if (!project) {
    return (
      <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">No Projects Found</h2>
          <p className="text-gray-500 mb-4">You don't have any active projects yet.</p>
          <Link href="/dashboard" className="bg-[#4F46E5] text-white px-4 py-2 rounded-lg font-semibold">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  const totalMilestones = project.milestones.length
  const completed = project.milestones.filter(m => m.status === "PAID").length
  const inProgress = project.milestones.filter(m => ["FUNDED", "SUBMITTED", "IN_REVIEW", "REVISION_REQUESTED", "DISPUTED"].includes(m.status)).length
  const remaining = project.milestones.filter(m => m.status === "PENDING").length
  
  const fundedAmount = project.milestones
    .filter(m => m.status !== "PENDING")
    .reduce((sum, m) => sum + m.amount, 0)
    
  const totalBudget = project.totalAmount

  const completedPct = totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0
  const progressPct = totalBudget > 0 ? Math.round((fundedAmount / totalBudget) * 100) : 0

  const currentMilestone = project.milestones.find(m => m.status !== "PAID") || project.milestones[project.milestones.length - 1]

  // ── Status filter ──
  const statusFilter = searchParams.status || ""
  const filteredMilestones = statusFilter
    ? project.milestones.filter(m => {
        if (statusFilter === "completed") return m.status === "PAID"
        if (statusFilter === "in_progress") return ["FUNDED", "SUBMITTED", "IN_REVIEW", "REVISION_REQUESTED", "DISPUTED"].includes(m.status)
        if (statusFilter === "pending") return m.status === "PENDING"
        return true
      })
    : project.milestones

  // ── Month-over-month trends ──
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  const thisMonthMilestones = project.milestones.filter(m => new Date(m.createdAt) >= thirtyDaysAgo).length
  const lastMonthMilestones = project.milestones.filter(m => {
    const d = new Date(m.createdAt)
    return d >= sixtyDaysAgo && d < thirtyDaysAgo
  }).length
  const milestoneTrend = thisMonthMilestones - lastMonthMilestones
  const milestoneTrendDir = milestoneTrend > 0 ? "up" : milestoneTrend < 0 ? "down" : "flat"
  const milestoneTrendColor = milestoneTrendDir === "up" ? "text-[#10B981]" : milestoneTrendDir === "down" ? "text-red-500" : "text-[#64748B]"
  const milestoneTrendArrow = milestoneTrendDir === "up" ? "↑" : milestoneTrendDir === "down" ? "↓" : "→"

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        details[open] .rotate-arrow { transform: rotate(180deg); }
      `}} />

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
            <Link href="/milestones" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Milestones
            </Link>
            {['Escrow & Payments', 'Disputes', 'Freelancers', 'Messages', 'Analytics', 'Reports', 'Settings'].map(item => (
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
              <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">Get advanced analytics, priority support and more.</p>
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
            <input type="text" placeholder="Search projects, freelancers, invoices..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
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
            
            <div className="text-[12px] font-bold text-[#4F46E5] mb-2 flex items-center gap-2">
              Projects <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg> <span className="text-[#64748B]">{project.title}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Milestones</h1>
                <p className="text-sm text-[#64748B]">Track progress, review submissions, and release payments for each milestone.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {[
                    { label: "All", value: "" },
                    { label: "In Progress", value: "in_progress" },
                    { label: "Completed", value: "completed" },
                    { label: "Pending", value: "pending" },
                  ].map(tab => (
                    <Link
                      key={tab.value}
                      href={`/milestones${tab.value ? `?status=${tab.value}${searchParams.projectId ? `&projectId=${searchParams.projectId}` : ''}` : searchParams.projectId ? `?projectId=${searchParams.projectId}` : ''}`}
                      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                        statusFilter === tab.value
                          ? 'bg-[#4F46E5] text-white'
                          : 'bg-white border border-gray-200 text-[#64748B] hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
                <Link href={`/projects/${project.id}/contract`} className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  + Add Milestone
                </Link>
              </div>
            </div>

            {/* Top Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
              {/* Total Milestones */}
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Total Milestones</div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none mb-1">{totalMilestones}</div>
                  <div className="text-[10px] text-[#64748B]">Across this project</div>
                </div>
              </div>
              {/* Completed */}
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Completed</div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none mb-1">{completed}</div>
                  <div className="text-[10px] text-[#64748B]">{completedPct}% of total</div>
                  <div className={`text-[9px] font-bold mt-0.5 ${milestoneTrendColor}`}>{milestoneTrendArrow} {Math.abs(milestoneTrend)} <span className="text-[#64748B] font-normal">vs last month</span></div>
                </div>
              </div>
              {/* In Progress */}
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-0.5">In Progress</div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none mb-1">{inProgress}</div>
                  <div className="text-[10px] text-[#64748B]">On track</div>
                </div>
              </div>
              {/* Remaining */}
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Remaining</div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none mb-1">{remaining}</div>
                  <div className="text-[10px] text-[#64748B]">Upcoming</div>
                </div>
              </div>
              {/* Milestone Budget */}
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#64748B] mb-0.5">Milestone Budget</div>
                  <div className="text-2xl font-bold text-[#0F172A] leading-none mb-1">₹{(totalBudget/100).toLocaleString()}</div>
                  <div className="text-[10px] text-[#10B981] font-semibold">of ₹{(fundedAmount/100).toLocaleString()} funded</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT COLUMN: Timeline */}
              <div className="lg:w-[70%] flex flex-col gap-6">
                
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Milestone Timeline</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">Expand All <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg></button>
                  </div>
                  
                  <div className="relative pl-4">
                    {/* Continuous Line */}
                    <div className="absolute left-7 top-4 bottom-12 w-[2px] bg-gray-100"></div>

                    {filteredMilestones.map((milestone, idx) => {
                      const isCompleted = milestone.status === "PAID"
                      const isUpcoming = milestone.status === "PENDING"
                      const isInProgress = !isCompleted && !isUpcoming
                      const isLast = idx === filteredMilestones.length - 1

                      let badgeColor = "bg-[#F8FAFC] text-[#64748B]"
                      let badgeText = "Upcoming"
                      let circleColor = "bg-gray-200 text-white border-white"
                      let amountColor = "text-[#64748B]"
                      let amountSub = "Funded"
                      
                      if (isCompleted) {
                        badgeColor = "bg-[#ECFDF5] text-[#10B981]"
                        badgeText = "Completed"
                        circleColor = "bg-[#10B981] text-white border-white"
                        amountColor = "text-[#10B981]"
                        amountSub = "Paid"
                      } else if (isInProgress) {
                        badgeColor = "bg-[#EEF2FF] text-[#4F46E5]"
                        badgeText = "In Progress"
                        circleColor = "bg-[#3B82F6] text-white border-white"
                        amountColor = "text-[#10B981]"
                        amountSub = "Funded"
                      }

                      return (
                        <div key={milestone.id} className="relative flex items-start gap-5 mb-8 last:mb-0 group">
                          {/* Dot */}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-4 relative mt-1 ${circleColor}`}>
                            {isCompleted ? (
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                            ) : (
                              <span className="text-[10px] font-bold">{milestone.sequence}</span>
                            )}
                          </div>
                          
                          {/* Content */}
                          <details className={`flex-1 rounded-xl transition-all ${isInProgress ? 'bg-white border border-gray-100 shadow-sm' : 'bg-transparent'}`} open={isInProgress}>
                            <summary className="flex items-start justify-between cursor-pointer p-4 focus:outline-none">
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold ${isInProgress ? 'bg-[#EEF2FF] text-[#4F46E5]' : 'bg-[#F8FAFC] text-[#64748B]'}`}>{milestone.sequence}</div>
                                  <h4 className="text-[14px] font-bold text-[#0F172A]">{milestone.title}</h4>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badgeText}</span>
                                </div>
                                <p className="text-[12px] text-[#64748B] mb-2">{milestone.deliverableDescription}</p>
                                <div className="flex items-center gap-4 text-[10px] text-[#64748B]">
                                  <span className="flex items-center gap-1"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Due: {milestone.dueDate ? milestone.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                                  {milestone.submissions[0] && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                      <span className="flex items-center gap-1"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> Submitted: {milestone.submissions[0].submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-right shrink-0">
                                <div>
                                  <div className="text-[13px] font-bold text-[#0F172A]">₹{(milestone.amount/100).toLocaleString()}</div>
                                  <div className={`text-[11px] font-bold ${amountColor}`}>{amountSub}</div>
                                </div>
                                {isInProgress ? (
                                  <div className="flex items-center gap-2">
                                    <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-colors">Review Submission</button>
                                    <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                                      <svg className="rotate-arrow transition-transform" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button className="px-4 py-1.5 rounded-lg border border-gray-200 text-[#0F172A] hover:bg-gray-50 text-[11px] font-semibold transition-colors">View Details</button>
                                    <div className="w-7 h-7 rounded-lg hover:bg-gray-50 text-gray-400 flex items-center justify-center shrink-0">
                                      <svg className="rotate-arrow transition-transform" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </summary>

                            {/* Expanded Content Details */}
                            {milestone.submissions[0] && (
                              <div className="px-4 pb-4 mt-2">
                                <div className="border-t border-gray-100 pt-4 flex gap-6">
                                  {/* Left: Freelancer Submission */}
                                  <div className="flex-1">
                                    <h5 className="text-[11px] font-bold text-[#64748B] mb-2">Freelancer Submission</h5>
                                    <div className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3 flex items-center justify-between mb-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        </div>
                                        <div>
                                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">{milestone.submissions[0].description || 'Submitted work'}</div>
                                          <div className="text-[10px] text-[#64748B]">{milestone.submissions[0].fileUrls.length} file{milestone.submissions[0].fileUrls.length !== 1 ? 's' : ''} submitted</div>
                                        </div>
                                      </div>
                                      <a href={milestone.submissions[0].fileUrls[0] || '#'} target="_blank" className="text-gray-400 hover:text-[#0F172A]"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></a>
                                    </div>
                                    {milestone.submissions[0].fileUrls.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {milestone.submissions[0].fileUrls.map((url: string, fi: number) => (
                                          <a key={fi} href={url} target="_blank" className="text-[10px] text-[#4F46E5] hover:underline bg-[#EEF2FF] px-2 py-0.5 rounded">File {fi + 1}</a>
                                        ))}
                                      </div>
                                    )}
                                    {milestone.submissions[0].linkEvidence && Array.isArray(milestone.submissions[0].linkEvidence) && (
                                      <div className="space-y-1">
                                        {(milestone.submissions[0].linkEvidence as { label: string; url: string }[]).map((link: { label: string; url: string }, li: number) => (
                                          <a key={li} href={link.url} target="_blank" className="block bg-[#EEF2FF] border border-[#EEF2FF] rounded-xl p-3 text-[11px] font-semibold text-[#4F46E5] flex items-center justify-between hover:bg-[#E0E7FF] transition-colors">
                                            <span className="flex items-center gap-2 overflow-hidden whitespace-nowrap text-ellipsis"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg> {link.label || link.url}</span>
                                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Middle: AI Validation */}
                                  <div className="flex-1 flex flex-col items-center">
                                    <h5 className="text-[11px] font-bold text-[#64748B] mb-2 w-full text-left">AI Validation</h5>
                                    {milestone.submissions[0].aiReview ? (
                                      <>
                                        <div className="flex items-center gap-6 w-full mb-3">
                                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center relative shrink-0 ${milestone.submissions[0].aiReview.confidence === 'HIGH' ? 'border-[#10B981]' : 'border-[#F59E0B]'}`}>
                                            <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${milestone.submissions[0].aiReview.confidence === 'HIGH' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`}></div>
                                            <div className="flex flex-col items-center">
                                              <span className="text-[15px] font-bold text-[#0F172A] leading-none">
                                                {milestone.submissions[0].aiReview.confidence === 'HIGH' ? 'High' : 'Review'}
                                              </span>
                                              <span className="text-[8px] text-[#64748B] font-bold">Confidence</span>
                                            </div>
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-[10px] text-[#64748B] leading-relaxed">{milestone.submissions[0].aiReview.matchSummary}</p>
                                          </div>
                                        </div>
                                        <span className="text-[9px] text-[#64748B]">AI v{milestone.submissions[0].aiReview.modelVersion}</span>
                                      </>
                                    ) : (
                                      <div className="w-full p-4 bg-gray-50 rounded-xl text-center">
                                        <p className="text-[11px] text-[#64748B]">No AI review yet. Submit work to trigger validation.</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Next Step */}
                                  <div className="flex-[0.8] flex flex-col">
                                    <h5 className="text-[11px] font-bold text-[#64748B] mb-2">Next Step</h5>
                                    <p className="text-[10px] text-[#64748B] leading-relaxed mb-4">
                                      {milestone.status === 'SUBMITTED' || milestone.status === 'IN_REVIEW'
                                        ? 'Please review the submission and approve or request changes.'
                                        : milestone.status === 'REVISION_REQUESTED'
                                        ? 'The freelancer has been notified to revise their submission.'
                                        : milestone.status === 'APPROVED'
                                        ? 'Milestone approved. Payment will be released.'
                                        : milestone.status === 'PAID'
                                        ? 'Payment has been released for this milestone.'
                                        : 'Awaiting submission from freelancer.'}
                                    </p>
                                    {milestone.status === 'SUBMITTED' || milestone.status === 'IN_REVIEW' ? (
                                      <Link href={`/projects/${project.id}/submit/${milestone.id}`} className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[11px] font-semibold py-2 rounded-lg transition-colors shadow-sm mb-2 text-center block">Review Submission</Link>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            )}
                          </details>
                        </div>
                      )
                    })}
                    
                    {/* Add Milestone Placeholder */}
                    <div className="flex items-center justify-center pt-2">
                      <Link href={`/projects/${project.id}/contract`} className="text-[12px] font-bold text-[#4F46E5] flex items-center gap-1.5 hover:underline">
                        + Add Milestone
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Sidebar Widgets */}
              <div className="lg:w-[30%] flex flex-col gap-6">
                
                {/* Project Summary */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-5">Project Summary</h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold text-lg shrink-0">
                      {project.title.charAt(0)}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#0F172A] mb-0.5">{project.client.name}</div>
                      <div className="text-[11px] text-[#64748B]">{project.title}</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 text-[12px]">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-[#64748B]">Total Budget</span>
                      <span className="font-bold text-[#0F172A]">₹{(totalBudget/100).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-[#64748B]">Amount Funded</span>
                      <span className="font-bold text-[#0F172A]">₹{(fundedAmount/100).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-[#64748B]">Escrow Status</span>
                      <span className="font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full text-[10px]">Funded</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[#64748B]">Project Progress</span>
                      <span className="font-bold text-[#0F172A]">{completedPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Current Milestone */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-4">Current Milestone</h3>
                  
                  {currentMilestone ? (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center text-[10px] font-bold shrink-0">{currentMilestone.sequence}</div>
                          <span className="text-[12px] font-bold text-[#0F172A] truncate max-w-[120px]">{currentMilestone.title}</span>
                        </div>
                        <span className="text-[9px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">In Progress</span>
                      </div>

                      <div className="flex flex-col gap-3 text-[11px]">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-[#64748B]">Due Date</span>
                          <span className="font-bold text-[#F59E0B]">
                            {currentMilestone.dueDate
                              ? (() => {
                                  const diffDays = Math.ceil((new Date(currentMilestone.dueDate).getTime() - Date.now()) / (1000 * 3600 * 24))
                                  return currentMilestone.status === 'PAID'
                                    ? new Date(currentMilestone.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                                    : diffDays < 0
                                    ? `${new Date(currentMilestone.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (Overdue by ${Math.abs(diffDays)} days)`
                                    : `${new Date(currentMilestone.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} (${diffDays} days left)`
                                })()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-[#64748B]">Milestone Amount</span>
                          <span className="font-bold text-[#0F172A]">₹{(currentMilestone.amount/100).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <span className="text-[#64748B]">Submitted On</span>
                          <span className="font-bold text-[#0F172A]">{
                            currentMilestone.submissions[0]
                              ? currentMilestone.submissions[0].submittedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Not submitted yet'
                          }</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748B]">Status</span>
                          <span className={`font-bold ${
                            currentMilestone.status === 'PAID' ? 'text-[#10B981]' :
                            ['SUBMITTED', 'IN_REVIEW'].includes(currentMilestone.status) ? 'text-[#4F46E5]' :
                            currentMilestone.status === 'DISPUTED' ? 'text-red-500' :
                            currentMilestone.status === 'PENDING' ? 'text-[#64748B]' :
                            'text-[#F59E0B]'
                          }`}>
                            {currentMilestone.status === 'PAID' ? 'Completed' :
                             currentMilestone.status === 'SUBMITTED' || currentMilestone.status === 'IN_REVIEW' ? 'Under Review' :
                             currentMilestone.status === 'DISPUTED' ? 'Disputed' :
                             currentMilestone.status === 'PENDING' ? 'Pending' :
                             currentMilestone.status === 'REVISION_REQUESTED' ? 'Revision Requested' :
                             currentMilestone.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-[12px] text-gray-500">All milestones completed.</div>
                  )}
                </div>

                {/* Milestone Tips */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#F59E0B]" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    <h3 className="font-bold text-[#0F172A] text-[14px]">Milestone Tips</h3>
                  </div>
                  <p className="text-[11px] text-[#64748B] mb-4">Clear milestones lead to better results.</p>

                  <ul className="flex flex-col gap-3 text-[11px] text-[#0F172A]">
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" fill="none" stroke="#10B981" strokeWidth="3" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M5 13l4 4L19 7"/></svg>
                      Be specific about deliverables
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" fill="none" stroke="#10B981" strokeWidth="3" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M5 13l4 4L19 7"/></svg>
                      Set realistic timelines
                    </li>
                    <li className="flex items-start gap-2">
                      <svg width="14" height="14" fill="none" stroke="#10B981" strokeWidth="3" viewBox="0 0 24 24" className="shrink-0 mt-0.5"><path d="M5 13l4 4L19 7"/></svg>
                      Review and provide feedback quickly
                    </li>
                  </ul>
                </div>

                {/* Need Help? */}
                <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#64748B] shrink-0 shadow-sm">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0F172A] text-[13px] mb-0.5">Need Help?</h4>
                    <p className="text-[11px] text-[#64748B] mb-2">Have questions about milestones?</p>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View Milestone Guide <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
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
