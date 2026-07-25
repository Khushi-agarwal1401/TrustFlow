import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"

function getContractStatus(contract: any) {
  const signatures = contract.signatures || []
  if (signatures.length >= 2) return "Active"
  if (signatures.length === 1) return "Pending Review"
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  if (new Date(contract.createdAt) < thirtyDaysAgo) return "Expired"

  return "Draft"
}

export default async function ContractsPage({ searchParams }: { searchParams: { tab?: string } }) {
  const activeTab = searchParams.tab || "all"
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsClient: {
        include: { 
          freelancer: true, 
          client: true,
          contract: { include: { signatures: true } }
        },
      },
      projectsAsFreelancer: {
        include: { 
          freelancer: true, 
          client: true,
          contract: { include: { signatures: true } }
        },
      },
    },
  })

  if (!user) redirect("/auth/signin")

  const allProjects = [...user.projectsAsClient, ...user.projectsAsFreelancer]
  const allContracts = allProjects
    .filter(p => p.contract)
    .map(p => ({
      ...p.contract!,
      project: p,
      derivedStatus: getContractStatus(p.contract!),
      isClient: p.clientId === user.id
    }))
    .sort((a, b) => {
      const dateA = a.signatures.length > 0 ? new Date(Math.max(...a.signatures.map(s => new Date(s.signedAt).getTime()))) : new Date(a.createdAt)
      const dateB = b.signatures.length > 0 ? new Date(Math.max(...b.signatures.map(s => new Date(s.signedAt).getTime()))) : new Date(b.createdAt)
      return dateB.getTime() - dateA.getTime()
    })

  const totals = {
    Total: allContracts.length,
    Active: allContracts.filter(c => c.derivedStatus === "Active").length,
    Pending: allContracts.filter(c => c.derivedStatus === "Pending Review").length,
    Drafts: allContracts.filter(c => c.derivedStatus === "Draft").length,
    Expired: allContracts.filter(c => c.derivedStatus === "Expired").length,
  }

  const getPct = (val: number) => totals.Total > 0 ? Math.round((val / totals.Total) * 100) : 0

  const activities = allContracts.flatMap(c => 
    c.signatures.map(s => ({
      id: s.id,
      contractId: c.id,
      projectTitle: c.project.title,
      type: "signed",
      date: new Date(s.signedAt),
      userName: c.project.clientId === s.userId ? c.project.client?.name : c.project.freelancer?.name,
    }))
  ).sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

  const filteredContracts = allContracts.filter(c => {
    if (activeTab === "all") return true;
    if (activeTab === "Completed") return c.derivedStatus === "Completed";
    return c.derivedStatus === activeTab;
  })

  return (
  return (
    <AppLayout user={user}>
      <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-8">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Contracts</h1>
                <p className="text-sm text-[#64748B]">AI-generated, legally sound contracts tailored to your project.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Templates
                </button>
                <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  + New Contract
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-6">
              {[
                { name: "All Contracts", value: "all" },
                { name: "Pending Review", value: "Pending Review" },
                { name: "Active", value: "Active" },
                { name: "Completed", value: "Completed" },
                { name: "Expired", value: "Expired" },
                { name: "Drafts", value: "Draft" },
              ].map(tab => (
                <Link key={tab.value} href={`/contracts?tab=${tab.value}`} className={`pb-4 text-sm font-bold ${activeTab === tab.value ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]' : 'font-medium text-[#64748B] hover:text-[#0F172A]'}`}>
                  {tab.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* LEFT COLUMN: Table */}
              <div className="lg:w-[70%] flex flex-col gap-6">
                
                {/* Table Area */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  {/* Table Toolbar */}
                  <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4 bg-white">
                    <div className="relative flex-1 min-w-[200px]">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      <input type="text" placeholder="Search contracts by project or freelancer..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Status</span>
                        <select className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                          <option>All</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 mb-0.5 ml-1">Type</span>
                        <select className="border border-gray-200 rounded-lg text-[13px] py-1.5 pl-3 pr-8 focus:outline-none bg-white font-medium text-[#0F172A] appearance-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                          <option>All</option>
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
                    <div className="w-[35%]">Contract</div>
                    <div className="w-[20%]">Project / Freelancer</div>
                    <div className="w-[15%]">Status</div>
                    <div className="w-[20%]">Last Updated</div>
                    <div className="w-[10%] text-right">Actions</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-gray-100 bg-white">
                    {filteredContracts.map((contract) => {
                      const latestDate = contract.signatures.length > 0 ? new Date(Math.max(...contract.signatures.map(s => new Date(s.signedAt).getTime()))) : new Date(contract.createdAt)
                      const isClient = contract.isClient
                      const targetUser = isClient ? contract.project.freelancer : contract.project.client

                      let statusColor = "text-[#64748B] bg-gray-100"
                      let dotColor = "bg-gray-400"
                      let subStatus = `Created on ${new Date(contract.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      
                      if (contract.derivedStatus === "Active") {
                        statusColor = "text-[#10B981]"
                        dotColor = "bg-[#10B981]"
                        subStatus = `Accepted on ${latestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      } else if (contract.derivedStatus === "Pending Review") {
                        statusColor = "text-[#F59E0B]"
                        dotColor = "bg-[#F59E0B]"
                        subStatus = `Sent on ${latestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      } else if (contract.derivedStatus === "Expired") {
                        statusColor = "text-red-500"
                        dotColor = "bg-red-500"
                        subStatus = `Expired on ${latestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      }

                      return (
                        <div key={contract.id} className="px-6 py-5 flex items-center hover:bg-[#F8FAFC]/50 transition-colors">
                          {/* Contract Info */}
                          <div className="w-[35%] pr-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#4F46E5]">
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-[#0F172A] text-[13px] truncate mb-1.5">{contract.project.title} - Agreement</h4>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6 4.8 2.4 7.6-6-4.8-6 4.8 2.4-7.6-6-4.8h7.6z"/></svg>
                                  AI Generated
                                </span>
                                <span className="text-[10px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full">v1</span>
                              </div>
                            </div>
                          </div>

                          {/* Project / Freelancer */}
                          <div className="w-[20%] pr-4">
                            <div className="text-[12px] font-bold text-[#0F172A] mb-1.5 truncate">{contract.project.title}</div>
                            {targetUser && (
                              <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 truncate">
                                <img src={targetUser.avatarUrl || `https://ui-avatars.com/api/?name=${targetUser.name}`} className="w-4 h-4 rounded-full object-cover" />
                                {targetUser.name}
                                <span className="text-gray-300">·</span>
                                <span className="text-[#10B981] font-semibold flex items-center gap-0.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>4.9</span>
                              </div>
                            )}
                          </div>

                          {/* Status */}
                          <div className="w-[15%] pr-4">
                            <div className={`flex items-center gap-1.5 text-[12px] font-bold ${statusColor} mb-1`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></div>
                              {contract.derivedStatus}
                            </div>
                            <div className="text-[10px] text-[#64748B]">{subStatus}</div>
                          </div>

                          {/* Last Updated */}
                          <div className="w-[20%] pr-4">
                            <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">{latestDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            <div className="text-[10px] text-[#64748B]">{latestDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>

                          {/* Actions */}
                          <div className="w-[10%] flex items-center justify-end gap-2 shrink-0">
                            <Link href={`/projects/${contract.projectId}/contract`} className="px-3 py-1.5 bg-white border border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5] text-[#0F172A] rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shadow-sm">
                              {contract.derivedStatus === "Pending Review" ? "Review" : (contract.derivedStatus === "Draft" ? "Edit" : "View")}
                            </Link>
                            <button className="text-gray-400 hover:text-[#0F172A]"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                          </div>

                        </div>
                      )
                    })}
                    {filteredContracts.length === 0 && <div className="p-8 text-center text-sm text-gray-500">No contracts found.</div>}
                  </div>

                  {/* Table Footer */}
                  <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between text-[13px] text-[#64748B]">
                    <div>Showing 1 to {filteredContracts.length} of {filteredContracts.length} contracts</div>
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

              {/* RIGHT COLUMN: Sidebar Widgets */}
              <div className="lg:w-[30%] flex flex-col gap-6">
                
                {/* Contracts Overview */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Contracts Overview</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline">View Report</button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Fake Donut Chart via SVG */}
                    <div className="relative w-24 h-24 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        {/* Background */}
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                        {/* Active */}
                        {getPct(totals.Active) > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray={`${getPct(totals.Active)}, 100`} />}
                        {/* Pending Review */}
                        {getPct(totals.Pending) > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray={`${getPct(totals.Pending)}, 100`} strokeDashoffset={`-${getPct(totals.Active)}`} />}
                        {/* Drafts */}
                        {getPct(totals.Drafts) > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#94A3B8" strokeWidth="4" strokeDasharray={`${getPct(totals.Drafts)}, 100`} strokeDashoffset={`-${getPct(totals.Active) + getPct(totals.Pending)}`} />}
                        {/* Expired */}
                        {getPct(totals.Expired) > 0 && <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="4" strokeDasharray={`${getPct(totals.Expired)}, 100`} strokeDashoffset={`-${getPct(totals.Active) + getPct(totals.Pending) + getPct(totals.Drafts)}`} />}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-[#0F172A]">{totals.Total}</span>
                        <span className="text-[9px] text-[#64748B] font-medium uppercase tracking-wider">Total</span>
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex-1 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#0F172A]"><div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>Active</div>
                        <div className="text-[#64748B] font-medium">{totals.Active} <span className="opacity-50">({getPct(totals.Active)}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#0F172A]"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></div>Pending Review</div>
                        <div className="text-[#64748B] font-medium">{totals.Pending} <span className="opacity-50">({getPct(totals.Pending)}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#0F172A]"><div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></div>Drafts</div>
                        <div className="text-[#64748B] font-medium">{totals.Drafts} <span className="opacity-50">({getPct(totals.Drafts)}%)</span></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 font-bold text-[#0F172A]"><div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>Expired</div>
                        <div className="text-[#64748B] font-medium">{totals.Expired} <span className="opacity-50">({getPct(totals.Expired)}%)</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Contract Assistant */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">AI Contract Assistant</h3>
                    <span className="flex items-center gap-1 text-[9px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6 4.8 2.4 7.6-6-4.8-6 4.8 2.4-7.6-6-4.8h7.6z"/></svg>
                      BETA
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] mb-5 leading-relaxed">Let AI help you create, review and improve contracts.</p>

                  <div className="flex flex-col gap-3 mb-5">
                    <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">Generate Contract</div>
                        <div className="text-[10px] text-[#64748B]">Create a contract from project details</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">Review Contract</div>
                        <div className="text-[10px] text-[#64748B]">AI-powered contract analysis</div>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-left">
                      <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center text-[#F59E0B] shrink-0">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">Suggest Clauses</div>
                        <div className="text-[10px] text-[#64748B]">Get smart clause recommendations</div>
                      </div>
                    </button>
                  </div>
                  
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#EEF2FF] bg-[#F8FAFC] hover:bg-[#EEF2FF] text-[#4F46E5] rounded-xl text-[12px] font-bold transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6H22l-6 4.8 2.4 7.6-6-4.8-6 4.8 2.4-7.6-6-4.8h7.6z"/></svg>
                    Open AI Assistant
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Recent Activity</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline">View all</button>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    {activities.map((activity, idx) => (
                      <div key={activity.id} className="flex items-start gap-3 relative">
                        {idx !== activities.length - 1 && <div className="absolute top-8 left-3.5 w-px h-8 bg-gray-100"></div>}
                        <div className="w-7 h-7 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981] shrink-0 z-10 border-2 border-white">
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                        </div>
                        <div>
                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5 leading-snug">{activity.userName || 'User'} accepted the contract for {activity.projectTitle}</div>
                          <div className="text-[10px] text-[#64748B]">
                            {activity.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • {activity.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && <div className="text-xs text-gray-400">No recent activity.</div>}
                  </div>
                </div>

              </div>
            </div>
          </div>
      </div>
    </AppLayout>
  )
}
