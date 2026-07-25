import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ProjectFilters } from "./project-filters"
import { ExportButton } from "./export-button"
import { Pagination } from "./pagination"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; health?: string; sort?: string; page?: string }>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const query = sp.q?.toLowerCase()?.trim() || ""
  const statusFilter = sp.status || ""
  const healthFilter = sp.health || ""
  const sortBy = sp.sort || "latest"
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10) || 1)
  const PER_PAGE = 10
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsClient: {
        include: { 
          freelancer: true, 
          client: true, 
          milestones: { orderBy: { sequence: 'asc' } },
          riskSignals: true
        },
        orderBy: { createdAt: "desc" },
      },
      projectsAsFreelancer: {
        include: { 
          freelancer: true, 
          client: true, 
          milestones: { orderBy: { sequence: 'asc' } },
          riskSignals: true
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) redirect("/auth/signin")

  let allProjects = [...user.projectsAsClient, ...user.projectsAsFreelancer]

  // ── Search filter ──
  if (query) {
    allProjects = allProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.freelancer?.name?.toLowerCase()?.includes(query) ||
        p.client?.name?.toLowerCase()?.includes(query) ||
        p.description?.toLowerCase()?.includes(query)
    )
  }

  // ── Status filter ──
  if (statusFilter) {
    allProjects = allProjects.filter((p) => p.status === statusFilter)
  }

  // ── Health filter ──
  if (healthFilter === "healthy") {
    allProjects = allProjects.filter((p) => p.riskSignals.length === 0)
  } else if (healthFilter === "at_risk") {
    allProjects = allProjects.filter((p) => p.riskSignals.length > 0)
  }

  // ── Sort ──
  allProjects.sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "budget_high":
        return b.totalAmount - a.totalAmount
      case "budget_low":
        return a.totalAmount - b.totalAmount
      case "name":
        return a.title.localeCompare(b.title)
      case "latest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  // ── Pagination ──
  const totalFiltered = allProjects.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedProjects = allProjects.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const activeProjects = allProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING" || p.status === "AWAITING_ACCEPTANCE")
  const completedProjects = allProjects.filter((p) => p.status === "COMPLETED")

  const escrowProtected = activeProjects.reduce((sum, p) => sum + p.totalAmount, 0)
  const atRiskCount = activeProjects.filter(p => p.riskSignals.length > 0).length

  // ── Month-over-month trends ──
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  function computeTrend<T extends { createdAt: Date }>(items: T[]): { diff: number; direction: "up" | "down" | "flat"; color: string } {
    const thisPeriod = items.filter(i => new Date(i.createdAt) >= thirtyDaysAgo).length
    const lastPeriod = items.filter(i => {
      const d = new Date(i.createdAt)
      return d >= sixtyDaysAgo && d < thirtyDaysAgo
    }).length
    const diff = thisPeriod - lastPeriod
    const direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat"
    const color = direction === "up" ? "text-[#10B981]" : direction === "down" ? "text-red-500" : "text-[#64748B]"
    return { diff, direction, color }
  }

  const totalTrend = computeTrend(allProjects)
  const activeTrend = computeTrend(activeProjects)
  const completedTrend = computeTrend(completedProjects)

  function TrendIndicator({ trend }: { trend: { diff: number; direction: string; color: string } }) {
    const arrow = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"
    const label = trend.direction === "up" ? "more than last month" : trend.direction === "down" ? "less than last month" : "same as last month"
    return (
      <div className={`text-[11px] font-bold ${trend.color}`}>
        {arrow} {Math.abs(trend.diff)} <span className="text-[#64748B] font-normal">{label}</span>
      </div>
    )
  }

  // Build export data — use the full filtered list, not just the current page
  const exportData = allProjects.map((p) => {
    const isHealthy = p.riskSignals.length === 0
    const currentMilestone = p.milestones.find(m => m.status !== 'PAID') || p.milestones[p.milestones.length - 1]
    const completedCount = p.milestones.filter(m => m.status === 'PAID').length
    const totalCount = p.milestones.length || 1
    const progressPct = Math.round((completedCount / totalCount) * 100)
    return {
      title: p.title,
      status: p.status.replace(/_/g, " "),
      health: isHealthy ? "Healthy" : "At Risk",
      freelancerName: p.freelancer?.name || "Unassigned",
      currentMilestone: currentMilestone?.title || "Completed",
      progressPct,
      completedMilestones: completedCount,
      totalMilestones: totalCount,
      budget: p.totalAmount,
      escrowStatus: p.status === "IN_PROGRESS" || p.status === "COMPLETED" ? "Funded" : "Pending",
      dueDate: currentMilestone?.dueDate
        ? new Date(currentMilestone.dueDate).toLocaleDateString("en-GB")
        : "N/A",
    }
  })

  return (
  return (
    <AppLayout user={user}>
      <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-8">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Projects</h1>
                <p className="text-sm text-[#64748B]">Manage all your projects, track progress, and ensure smooth delivery.</p>
              </div>
              <div className="flex items-center gap-3">
                <ExportButton projects={exportData} />
                <Link href="/projects/new" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  + New Project
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                </Link>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#4F46E5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>Total Projects</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">{allProjects.length}</div>
                    <TrendIndicator trend={totalTrend} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Active Projects</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">{activeProjects.length}</div>
                    <TrendIndicator trend={activeTrend} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#3B82F6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Completed</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">{completedProjects.length}</div>
                    <TrendIndicator trend={completedTrend} />
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#4F46E5]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Total Escrow Protected</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">₹{(escrowProtected / 100).toLocaleString()}</div>
                    <div className="text-[11px] text-[#64748B]">Across all projects</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#FEF2F2] p-5 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-500 mb-2"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>At Risk</div>
                    <div className="text-[28px] font-bold text-red-600 tracking-tight leading-none mb-2">{atRiskCount}</div>
                    <div className="text-[11px] font-bold text-red-500">Needs attention</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Area */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
              
              {/* Table Toolbar */}
              <div className="p-4 border-b border-gray-100 bg-white">
                <ProjectFilters totalProjects={totalFiltered} />
              </div>

              {/* Table Header */}
              <div className="bg-[#F8FAFC] border-b border-gray-100 px-6 py-3 flex text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                <div className="w-[30%]">Project</div>
                <div className="w-[12%]">Health</div>
                <div className="w-[18%]">Current Milestone</div>
                <div className="w-[10%]">Progress</div>
                <div className="w-[12%]">Budget / Escrow</div>
                <div className="w-[10%]">Deadline</div>
                <div className="w-[8%] text-right">Next Action</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100 bg-white">
                {paginatedProjects.map((project) => {
                  const isHealthy = project.riskSignals.length === 0
                  
                  let currentMilestone = project.milestones.find(m => m.status !== 'PAID')
                  if (!currentMilestone) {
                    currentMilestone = project.milestones[project.milestones.length - 1]
                  }
                  
                  const completedMilestones = project.milestones.filter(m => m.status === 'PAID').length
                  const totalMilestones = project.milestones.length || 1
                  const progressPct = Math.round((completedMilestones / totalMilestones) * 100)

                  const avatarChar = project.title.charAt(0)
                  const isClient = project.clientId === user.id
                  
                  const getStatusBadge = (status: string) => {
                    if (status === 'IN_PROGRESS' || status === 'AWAITING_FUNDING') return <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">Active</span>
                    if (status === 'COMPLETED') return <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">Completed</span>
                    return <span className="bg-[#FFFBEB] text-[#F59E0B] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">{status.replace(/_/g, ' ')}</span>
                  }

                  let milestoneStatusText = "In Progress"
                  let milestoneStatusColor = "text-[#4F46E5]"
                  if (currentMilestone?.status === "PAID") {
                    milestoneStatusText = "Completed"
                    milestoneStatusColor = "text-[#10B981]"
                  }

                  const dueDate = currentMilestone?.dueDate ? new Date(currentMilestone.dueDate) : null
                  let dueText = ""
                  let dueColor = ""
                  if (dueDate) {
                    const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    if (currentMilestone?.status === "PAID") {
                       dueText = "Completed"
                       dueColor = "text-[#64748B]"
                    } else if (diffDays < 0) {
                       dueText = `Overdue by ${Math.abs(diffDays)} days`
                       dueColor = "text-red-500"
                    } else {
                       dueText = `Due in ${diffDays} days`
                       dueColor = "text-[#F59E0B]"
                    }
                  }

                  // ── Dynamic Next Action ──
                  let nextAction = ""
                  if (project.status === "DRAFT") {
                    nextAction = isClient ? "Send to freelancer" : "Awaiting client"
                  } else if (project.status === "AWAITING_ACCEPTANCE") {
                    nextAction = isClient ? "Waiting for acceptance" : "Accept the project"
                  } else if (project.status === "AWAITING_FUNDING") {
                    nextAction = isClient ? "Fund escrow" : "Waiting for funding"
                  } else if (project.status === "IN_PROGRESS") {
                    nextAction = isClient ? "Review work" : (currentMilestone?.status === "SUBMITTED" || currentMilestone?.status === "IN_REVIEW" ? "Waiting for review" : "Submit work")
                  } else if (project.status === "COMPLETED") {
                    nextAction = "Completed"
                  } else if (project.status === "DISPUTED") {
                    nextAction = "Resolve dispute"
                  } else if (project.status === "CANCELLED") {
                    nextAction = "Closed"
                  }

                  return (
                    <div key={project.id} className="px-6 py-4 flex items-center hover:bg-[#F8FAFC]/50 transition-colors">
                      {/* Project */}
                      <div className="w-[30%] pr-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0 ${['bg-[#4F46E5]', 'bg-[#10B981]', 'bg-[#F59E0B]', 'bg-[#3B82F6]', 'bg-red-500'][Math.abs(project.id.charCodeAt(0)) % 5]}`}>
                          {avatarChar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-bold text-[#0F172A] text-[13px] truncate">{project.title}</h4>
                            {getStatusBadge(project.status)}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 truncate">
                            <img src={project.freelancer?.avatarUrl || `https://ui-avatars.com/api/?name=${project.freelancer?.name || 'F'}`} className="w-4 h-4 rounded-full object-cover" />
                            {project.freelancer?.name}
                            <span className="text-gray-300">·</span>
                            <span className="text-[#10B981] font-semibold flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>4.9</span>
                          </div>
                        </div>
                      </div>

                      {/* Health */}
                      <div className="w-[12%] pr-4">
                        {isHealthy ? (
                          <>
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#10B981] mb-0.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>Healthy</div>
                            <div className="text-[11px] text-[#64748B]">No risk signals</div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 text-[12px] font-bold text-red-500 mb-0.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>At Risk</div>
                            <div className="text-[11px] text-[#64748B]">{project.riskSignals.length} risk signal{project.riskSignals.length > 1 ? 's' : ''}</div>
                          </>
                        )}
                      </div>

                      {/* Current Milestone */}
                      <div className="w-[18%] pr-4">
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5 truncate">{currentMilestone ? currentMilestone.title : "Completed"}</div>
                        <div className="text-[11px] text-[#64748B] mb-1 truncate">{currentMilestone?.deliverableDescription || 'All milestones finished'}</div>
                        <div className={`text-[10px] font-bold ${milestoneStatusColor}`}>{milestoneStatusText}</div>
                      </div>

                      {/* Progress */}
                      <div className="w-[10%] pr-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full border-[3px] border-gray-100 flex items-center justify-center relative shrink-0">
                          <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-[#4F46E5]" strokeDasharray={`${progressPct}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                          </svg>
                          <span className="text-[10px] font-bold text-[#0F172A]">{progressPct}%</span>
                        </div>
                        <div className="text-[12px] font-bold text-[#0F172A]">{completedMilestones} <span className="text-[#64748B] font-normal">/ {totalMilestones}</span></div>
                      </div>

                      {/* Budget / Escrow */}
                      <div className="w-[12%] pr-4">
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5 truncate">₹{(currentMilestone?.amount || project.totalAmount) / 100}</div>
                        <div className="text-[10px] text-[#64748B] mb-1.5 truncate">of ₹{project.totalAmount / 100}</div>
                        {project.status === 'IN_PROGRESS' || project.status === 'COMPLETED' ? (
                          <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Escrow Funded</span>
                        ) : (
                          <span className="bg-[#FFFBEB] text-[#F59E0B] px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Partially Funded</span>
                        )}
                      </div>

                      {/* Deadline */}
                      <div className="w-[10%] pr-4">
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">{dueDate ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                        <div className={`text-[10px] font-medium ${dueColor}`}>{dueText}</div>
                      </div>

                      {/* Next Action */}
                      <div className="w-[8%] flex flex-col items-end justify-center shrink-0 ml-auto">
                        <div className="text-[9px] font-semibold text-[#4F46E5] mb-1 uppercase tracking-wider whitespace-nowrap">{nextAction}</div>
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`} className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5] text-[#0F172A] rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shadow-sm">View Details</Link>
                          <button className="text-gray-400 hover:text-[#0F172A]"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                        </div>
                      </div>

                    </div>
                  )
                })}
                {paginatedProjects.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No projects found.</div>}
              </div>

              {/* Table Footer */}
              <Pagination currentPage={safePage} totalPages={totalPages} totalItems={totalFiltered} />

            </div>
            </div>
          </div>
      </div>
    </AppLayout>
  )
}
