import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProjectsPage() {
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

  const allProjects = [...user.projectsAsClient, ...user.projectsAsFreelancer]
  const activeProjects = allProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING" || p.status === "AWAITING_ACCEPTANCE")
  const completedProjects = allProjects.filter((p) => p.status === "COMPLETED")
  
  const escrowProtected = activeProjects.reduce((sum, p) => sum + p.totalAmount, 0)
  const atRiskCount = activeProjects.filter(p => p.riskSignals.length > 0).length

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* LEFT SIDEBAR (Copied from Dashboard) */}
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
            <Link href="/projects" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg">
              <div className="w-[18px] h-[18px] bg-gray-300 rounded-sm opacity-50 hidden"></div>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              Projects
            </Link>
            {['Contracts', 'Milestones', 'Escrow & Payments', 'Disputes', 'Messages', 'Analytics', 'Freelancers', 'Settings'].map(item => (
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
               {user.avatarUrl ? <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
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
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Projects</h1>
                <p className="text-sm text-[#64748B]">Manage all your projects, track progress, and ensure smooth delivery.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Export
                </button>
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
                    <div className="text-[11px] font-bold text-[#10B981]">↑ 2 <span className="text-[#64748B] font-normal">from last month</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#10B981]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>Active Projects</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">{activeProjects.length}</div>
                    <div className="text-[11px] font-bold text-[#10B981]">↑ 1 <span className="text-[#64748B] font-normal">from last month</span></div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B] mb-2"><svg width="14" height="14" className="text-[#3B82F6]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Completed</div>
                    <div className="text-[28px] font-bold text-[#0F172A] tracking-tight leading-none mb-2">{completedProjects.length}</div>
                    <div className="text-[11px] font-bold text-[#10B981]">↑ 2 <span className="text-[#64748B] font-normal">from last month</span></div>
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
              <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-white">
                <div className="relative flex-1 min-w-[200px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  <input type="text" placeholder="Search projects by name or freelancer..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Status</span>
                    <select className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                      <option>All</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Health</span>
                    <select className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                      <option>All</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Sort by</span>
                    <select className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                      <option>Latest</option>
                    </select>
                  </div>
                  <div className="h-full flex items-end">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-medium text-[#0F172A] hover:bg-gray-50 flex items-center gap-2 transition-colors h-[34px]">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                      Filters
                    </button>
                  </div>
                </div>
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
                {allProjects.map((project) => {
                  const isHealthy = project.riskSignals.length === 0
                  
                  let currentMilestone = project.milestones.find(m => m.status !== 'COMPLETED')
                  if (!currentMilestone) {
                    currentMilestone = project.milestones[project.milestones.length - 1] // if all completed, take last
                  }
                  
                  const completedMilestones = project.milestones.filter(m => m.status === 'COMPLETED').length
                  const totalMilestones = project.milestones.length || 1
                  const progressPct = Math.round((completedMilestones / totalMilestones) * 100)

                  const avatarChar = project.title.charAt(0)
                  
                  const getStatusBadge = (status: string) => {
                    if (status === 'IN_PROGRESS' || status === 'AWAITING_FUNDING') return <span className="bg-[#EEF2FF] text-[#4F46E5] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">Active</span>
                    if (status === 'COMPLETED') return <span className="bg-[#ECFDF5] text-[#10B981] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">Completed</span>
                    return <span className="bg-[#FFFBEB] text-[#F59E0B] px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">{status.replace(/_/g, ' ')}</span>
                  }

                  let milestoneStatusText = "In Progress"
                  let milestoneStatusColor = "text-[#4F46E5]"
                  if (currentMilestone?.status === "COMPLETED") {
                    milestoneStatusText = "Completed"
                    milestoneStatusColor = "text-[#10B981]"
                  }

                  const dueDate = currentMilestone?.dueDate ? new Date(currentMilestone.dueDate) : null
                  let dueText = ""
                  let dueColor = ""
                  if (dueDate) {
                    const diffDays = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                    if (currentMilestone?.status === "COMPLETED") {
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
                        <div className="text-[9px] font-semibold text-[#4F46E5] mb-1 uppercase tracking-wider whitespace-nowrap">Review submission</div>
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`} className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5] text-[#0F172A] rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shadow-sm">Review Now</Link>
                          <button className="text-gray-400 hover:text-[#0F172A]"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                        </div>
                      </div>

                    </div>
                  )
                })}
                {allProjects.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No projects found.</div>}
              </div>

              {/* Table Footer */}
              <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between text-[13px] text-[#64748B]">
                <div>Showing 1 to {allProjects.length} of {allProjects.length} projects</div>
                <div className="flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg></button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-bold">1</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-[#0F172A]" disabled>2</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 font-medium text-[#0F172A]" disabled>3</button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" disabled><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
