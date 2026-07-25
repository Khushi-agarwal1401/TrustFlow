import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DisputeFilters } from "./dispute-filters"
import { DisputePagination } from "./dispute-pagination"

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

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

function daysUntil(dueDate: Date | null | undefined): number | null {
  if (!dueDate) return null
  return Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default async function DisputesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/auth/signin")

  const sp = await searchParams
  const query = ((sp.q as string) || "").toLowerCase()
  const statusFilter = (sp.status as string) || ""
  const projectFilter = (sp.project as string) || ""
  const dateRangeDays = parseInt((sp.dateRange as string) || "", 10) || 0
  const currentPage = Math.max(1, parseInt((sp.page as string) || "1", 10))
  const PER_PAGE = 8

  // Fetch all disputes for projects where user is client or freelancer
  const projects = await prisma.project.findMany({
    where: { OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }] },
    include: {
      client: true,
      freelancer: true,
      milestones: {
        include: {
          disputes: {
            include: {
              opener: { select: { id: true, name: true } },
            },
          },
        },
      },
    }
  })

  // Extract and enrich disputes
  const allDisputes = projects.flatMap(p => 
    p.milestones.flatMap(m => 
      m.disputes.map(d => ({
        ...d,
        project: p,
        milestone: m,
      }))
    )
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  // Apply filters
  let filtered = allDisputes
  if (query) {
    filtered = filtered.filter(d =>
      d.milestone.title.toLowerCase().includes(query) ||
      d.project.title.toLowerCase().includes(query)
    )
  }
  if (statusFilter) {
    filtered = filtered.filter(d => d.status === statusFilter)
  }
  if (projectFilter) {
    filtered = filtered.filter(d => d.project.id === projectFilter)
  }
  if (dateRangeDays > 0) {
    const cutoff = new Date(Date.now() - dateRangeDays * 24 * 60 * 60 * 1000)
    filtered = filtered.filter(d => d.createdAt >= cutoff)
  }

  // Pagination
  const totalFiltered = filtered.length
  const totalPages = Math.ceil(totalFiltered / PER_PAGE)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const paginatedDisputes = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  // Build project options for filter
  const projectOptions = Array.from(new Map(projects.map(p => [p.id, p.title])).entries())
    .map(([value, label]) => ({ value, label }))

  // Calculate top KPI totals (from filtered)
  const totalDisputes = filtered.length
  const awaitingResponse = filtered.filter(d => d.status === "EVIDENCE_PENDING").length
  const inProgress = filtered.filter(d => d.status === "AI_SUGGESTED").length
  const resolved = filtered.filter(d => d.status === "RESOLVED_ACCEPTED" || d.status === "RESOLVED_ADMIN").length
  const escalated = filtered.filter(d => d.status === "ESCALATED").length

  // Calculate percentages for the donut chart
  const divisor = totalDisputes || 1
  const awaitingPct = Math.round((awaitingResponse / divisor) * 100)
  const inProgressPct = Math.round((inProgress / divisor) * 100)
  const resolvedPct = Math.round((resolved / divisor) * 100)
  const escalatedPct = Math.round((escalated / divisor) * 100)

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
            <Link href="/disputes" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Disputes
            </Link>
            {['Freelancers', 'Messages', 'Analytics', 'Reports', 'Settings'].map(item => (
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
              <p className="text-[11px] text-[#64748B] mb-3 leading-relaxed">Unlock advanced dispute resolution, priority support and more.</p>
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
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Disputes</h1>
                <p className="text-sm text-[#64748B]">Resolve issues fairly with evidence, AI assistance, and expert support.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="#how-it-works" className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  Dispute Guide
                </Link>
                <Link href="/projects" className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Raise a Dispute
                </Link>
              </div>
            </div>

            {/* Top Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Disputes</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{totalDisputes}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Across all projects</div>
                <Link href="/disputes" className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View all</Link>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Awaiting Response</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{awaitingResponse}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Needs your action</div>
                <Link href="/disputes?status=EVIDENCE_PENDING" className="text-[11px] font-bold text-[#F59E0B] hover:underline flex items-center gap-1">Review now</Link>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">In Progress</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{inProgress}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Under review</div>
                <Link href="/disputes?status=AI_SUGGESTED" className="text-[11px] font-bold text-[#3B82F6] hover:underline flex items-center gap-1">View progress</Link>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Resolved</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{resolved}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Successfully resolved</div>
                <Link href="/disputes?status=RESOLVED_ACCEPTED" className="text-[11px] font-bold text-[#10B981] hover:underline flex items-center gap-1">View resolved</Link>
              </div>

              <div className="flex-1 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Escalated</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">{escalated}</div>
                <div className="text-[11px] text-[#64748B] mb-4">With admin</div>
                <Link href="/disputes?status=ESCALATED" className="text-[11px] font-bold text-[#EF4444] hover:underline flex items-center gap-1">View escalated</Link>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN: Disputes Table */}
              <div className="lg:w-[70%] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Search & Filters */}
                <div className="p-5 border-b border-gray-100 bg-white">
                  <DisputeFilters projectOptions={projectOptions} />
                </div>

                {/* Table Header */}
                <div className="bg-[#F8FAFC] border-b border-gray-100 flex items-center px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <div className="w-[30%]">Dispute</div>
                  <div className="w-[25%]">Project / Freelancer</div>
                  <div className="w-[20%]">Status</div>
                  <div className="w-[15%]">Raised On</div>
                  <div className="w-[10%]">Next Step</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 bg-white">
                  {paginatedDisputes.length > 0 ? paginatedDisputes.map((dispute) => {
                    const recipient = dispute.project.clientId === user.id ? dispute.project.freelancer : dispute.project.client
                    const days = daysUntil(dispute.milestone.dueDate)
                    
                    let icon, iconBg, badge, badgeColor, subStatus, nextStep, borderLeft;

                    if (dispute.status === "EVIDENCE_PENDING") {
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      iconBg = "bg-[#FEF2F2] text-[#EF4444]"
                      badge = "Awaiting Response"
                      badgeColor = "text-[#EF4444]"
                      subStatus = `Opened ${formatTimeAgo(dispute.createdAt)}`
                      nextStep = (
                        <Link href={`/disputes/${dispute.id}`} className="px-3 py-1 border border-gray-200 rounded-md text-[11px] font-bold text-[#4F46E5] hover:bg-gray-50 whitespace-nowrap">
                          Respond
                        </Link>
                      )
                      borderLeft = "border-l-4 border-transparent hover:border-[#EF4444]"
                    } else if (dispute.status === "AI_SUGGESTED") {
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                      iconBg = "bg-[#EFF6FF] text-[#3B82F6]"
                      badge = "AI Suggested"
                      badgeColor = "text-[#3B82F6]"
                      subStatus = days !== null ? (days > 0 ? `Due in ${days} days` : `Overdue by ${Math.abs(days)} days`) : "Under review"
                      nextStep = (
                        <Link href={`/disputes/${dispute.id}`} className="flex flex-col items-start gap-1">
                          <span className="text-[11px] font-bold text-[#0F172A]">Review</span>
                          {days !== null && <span className={`text-[10px] font-bold ${days > 0 ? 'text-[#3B82F6]' : 'text-red-500'}`}>{days > 0 ? `Due in ${days}d` : `${Math.abs(days)}d overdue`}</span>}
                        </Link>
                      )
                      borderLeft = "border-l-4 border-[#3B82F6]"
                    } else if (dispute.status === "RESOLVED_ACCEPTED" || dispute.status === "RESOLVED_ADMIN") {
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      iconBg = "bg-[#ECFDF5] text-[#10B981]"
                      badge = "Resolved"
                      badgeColor = "text-[#10B981]"
                      subStatus = `Resolved on ${dispute.resolvedAt ? new Date(dispute.resolvedAt).toLocaleDateString() : 'recently'}`
                      nextStep = (
                        <span className="text-[11px] font-bold text-[#10B981]">Resolved</span>
                      )
                      borderLeft = "border-l-4 border-[#10B981] bg-gray-50/50"
                    } else {
                      // ESCALATED
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      iconBg = "bg-[#FFFBEB] text-[#F59E0B]"
                      badge = "Escalated"
                      badgeColor = "text-[#F59E0B]"
                      subStatus = `Escalated ${formatTimeAgo(dispute.createdAt)}`
                      nextStep = (
                        <Link href={`/disputes/${dispute.id}`} className="flex flex-col items-start gap-1">
                          <span className="text-[11px] font-bold text-[#0F172A]">View</span>
                        </Link>
                      )
                      borderLeft = "border-l-4 border-[#F59E0B]"
                    }

                    return (
                      <Link key={dispute.id} href={`/disputes/${dispute.id}`} className={`flex items-center px-6 py-5 hover:bg-gray-50 transition-colors group cursor-pointer ${borderLeft}`}>
                        <div className="w-[30%] flex items-start gap-3 pr-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
                            {icon}
                          </div>
                          <div>
                            <div className="text-[13px] font-bold text-[#0F172A] mb-1 line-clamp-1">{dispute.milestone.title}</div>
                            <div className="text-[11px] text-[#64748B] line-clamp-1">{dispute.resolutionNotes || "Dispute under review"}</div>
                          </div>
                        </div>
                        
                        <div className="w-[25%] pr-4">
                          <div className="text-[12px] font-bold text-[#0F172A] mb-1.5 truncate">{dispute.project.title}</div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gray-200 overflow-hidden shrink-0">
                               {recipient?.avatarUrl ? <img src={recipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                            </div>
                            <span className="text-[11px] font-semibold text-[#0F172A]">{recipient?.name || 'User'}</span>
                          </div>
                        </div>

                        <div className="w-[20%] pr-4">
                           <div className={`text-[10px] font-bold ${badgeColor} flex items-center gap-1.5 mb-1.5`}><span className="w-1.5 h-1.5 rounded-full bg-current"></span> {badge}</div>
                           <div className="text-[10px] text-[#64748B]">{subStatus}</div>
                        </div>

                        <div className="w-[15%]">
                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">{new Date(dispute.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          <div className="text-[10px] text-[#64748B]">{new Date(dispute.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>

                        <div className="w-[10%] flex items-center justify-between">
                          {nextStep}
                          <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    )
                  }) : (
                    <div className="p-12 text-center">
                      <p className="text-sm text-gray-500 font-medium">No disputes found</p>
                      <p className="text-xs text-gray-400 mt-1">Disputes will appear here when a milestone is disputed.</p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <DisputePagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={totalFiltered}
                />

              </div>

              {/* RIGHT COLUMN: Sidebar Widgets */}
              <div className="lg:w-[30%] flex flex-col gap-6">
                
                {/* Dispute Insights Donut */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Dispute Insights</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View Report <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative w-[110px] h-[110px] shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F1F5F9" strokeWidth="3"></circle>
                        {/* Red Escalated */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray={`${escalatedPct} 100`} strokeDashoffset="0"></circle>
                        {/* Green Resolved */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray={`${resolvedPct} 100`} strokeDashoffset={`-${escalatedPct}`}></circle>
                        {/* Blue In Progress */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray={`${inProgressPct} 100`} strokeDashoffset={`-${escalatedPct + resolvedPct}`}></circle>
                        {/* Orange Awaiting */}
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray={`${awaitingPct} 100`} strokeDashoffset={`-${escalatedPct + resolvedPct + inProgressPct}`}></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[20px] font-bold text-[#0F172A] leading-none mb-1">{totalDisputes}</span>
                        <span className="text-[10px] text-[#64748B] font-medium">Total</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span><span className="text-[#0F172A] font-medium">Awaiting Response</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{awaitingResponse}</span><span className="text-[9px] text-[#64748B]">({awaitingPct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span><span className="text-[#0F172A] font-medium">In Progress</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{inProgress}</span><span className="text-[9px] text-[#64748B]">({inProgressPct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span><span className="text-[#0F172A] font-medium">Resolved</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{resolved}</span><span className="text-[9px] text-[#64748B]">({resolvedPct}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span><span className="text-[#0F172A] font-medium">Escalated</span></div>
                        <div className="flex items-center gap-1.5"><span className="font-bold text-[#0F172A]">{escalated}</span><span className="text-[9px] text-[#64748B]">({escalatedPct}%)</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* How Disputes Work */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-[#0F172A] text-[15px] mb-5">How Disputes Work</h3>
                  
                  <div className="relative pl-3">
                    <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gray-100"></div>
                    
                    <div className="flex gap-4 mb-5 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">1 Raise Dispute</div>
                        <div className="text-[11px] text-[#64748B]">Submit issue with evidence</div>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-5 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">AI Review</div>
                        <div className="text-[11px] text-[#64748B]">AI analyzes and suggests resolution</div>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-5 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">Resolution</div>
                        <div className="text-[11px] text-[#64748B]">Parties resolve or escalate</div>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">Admin Review</div>
                        <div className="text-[11px] text-[#64748B]">Expert intervention if needed</div>
                      </div>
                    </div>
                  </div>

                  <Link href="/disputes#how-it-works" className="mt-6 text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View full process <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></Link>
                </div>

                {/* Need Help */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-[#0F172A] mb-1">Need Help?</h4>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">Our support team is here to help you resolve disputes fairly.</p>
                    </div>
                  </div>
                  <a href="mailto:support@trustflow.ai" className="block w-full mt-2 py-2 border border-[#EEF2FF] bg-white hover:bg-[#EEF2FF] text-[#4F46E5] rounded-lg text-[11px] font-bold transition-colors text-center">
                    Contact Support
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
