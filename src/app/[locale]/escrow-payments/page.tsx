import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function EscrowPaymentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect("/auth/signin")

  // Fetch all user projects and their milestones
  const projects = await prisma.project.findMany({
    where: { OR: [{ clientId: session.user.id }, { freelancerId: session.user.id }] },
    include: {
      client: true,
      freelancer: true,
      milestones: {
        include: {
          escrowTransactions: true
        }
      }
    }
  })

  // Extract all transactions
  const transactions = projects.flatMap(p => 
    p.milestones.flatMap(m => 
      m.escrowTransactions.map(t => ({
        ...t,
        project: p,
        milestone: m,
      }))
    )
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  // Calculate top KPI totals
  let totalFunded = 0
  let totalReleased = 0
  let pendingRelease = 0
  let escrowBalance = 0
  let inDispute = 0

  projects.forEach(p => {
    p.milestones.forEach(m => {
      if (m.status === "FUNDED" || m.status === "PAID") totalFunded += m.amount
      if (m.status === "PAID") totalReleased += m.amount
      if (m.status === "SUBMITTED" || m.status === "IN_REVIEW") pendingRelease += m.amount
      if (m.status === "FUNDED") escrowBalance += m.amount
      if (m.status === "DISPUTED") inDispute += m.amount
    })
  })

  const totalFeesPaid = Math.round(totalReleased * 0.05) // 5% fee

  // Donut chart calculations
  const totalEscrowPool = escrowBalance + pendingRelease + inDispute || 1 // Avoid divide by zero
  const escrowAvailablePct = Math.round((escrowBalance / totalEscrowPool) * 100)
  const pendingReleasePct = Math.round((pendingRelease / totalEscrowPool) * 100)
  
  // Calculate running balances (if there were transactions)
  let runningBalance = 0
  const txWithBalance = [...transactions].reverse().map(tx => {
    if (tx.type === "FUND") runningBalance += tx.amount
    if (tx.type === "RELEASE" || tx.type === "REFUND") runningBalance -= tx.amount
    return { ...tx, balance: runningBalance }
  }).reverse()

  const recentPayouts = transactions.filter(t => t.type === "RELEASE").slice(0, 3)

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
            <Link href="/escrow-payments" className="flex items-center gap-3 px-3 py-2.5 bg-[#EEF2FF] text-[#4F46E5] font-medium rounded-lg transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              Escrow & Payments
            </Link>
            {['Disputes', 'Freelancers', 'Messages', 'Analytics', 'Reports', 'Settings'].map(item => (
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
                <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Escrow & Payments</h1>
                <p className="text-sm text-[#64748B]">Manage escrow funds, track transactions, and view payout history.</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Add Funds
                </button>
                <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
              <button className="pb-4 text-sm font-bold text-[#4F46E5] border-b-2 border-[#4F46E5]">Overview</button>
              <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Transactions</button>
              <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Payouts</button>
              <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A]">Invoices</button>
            </div>

            {/* Top Cards */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Escrow Balance</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">₹{(escrowBalance/100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Available for release</div>
                <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View breakdown <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
              </div>

              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Funded</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">₹{(totalFunded/100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Across {projects.length} projects</div>
                <div className="text-[11px] font-bold text-[#10B981] flex items-center gap-1"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg> 18% <span className="text-[#64748B] font-medium">from last month</span></div>
              </div>

              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Released</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">₹{(totalReleased/100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-4">To freelancers</div>
                <div className="text-[11px] font-bold text-[#10B981] flex items-center gap-1"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg> 12% <span className="text-[#64748B] font-medium">from last month</span></div>
              </div>

              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] text-[#F59E0B] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Pending Release</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">₹{(pendingRelease/100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Awaiting your approval</div>
                <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">Review now <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
              </div>

              <div className="flex-1 min-w-[200px] bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-[#64748B] flex items-center justify-center shrink-0">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                  </div>
                  <div className="text-[12px] font-bold text-[#64748B]">Total Fees Paid</div>
                </div>
                <div className="text-[26px] font-bold text-[#0F172A] leading-none mb-2">₹{(totalFeesPaid/100).toLocaleString()}</div>
                <div className="text-[11px] text-[#64748B] mb-4">Platform fees</div>
                <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View details <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* LEFT COLUMN: Transactions Table */}
              <div className="lg:w-[70%] bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Search & Filters */}
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
                  <div className="relative w-64 shrink-0">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all" />
                  </div>
                  
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Type</span>
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[position:right_10px_center]">
                        <option>All Types</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Project</span>
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[position:right_10px_center]">
                        <option>All Projects</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#64748B] mb-1 px-1">Date Range</span>
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#0F172A] font-semibold bg-white outline-none cursor-pointer hover:bg-gray-50 appearance-none pr-8 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzY0NzQ4QiIgc3Ryb2tlLXdpZHRoPSIyIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==')] bg-no-repeat bg-[position:right_10px_center]">
                        <option>Last 30 Days</option>
                      </select>
                    </div>
                    <div className="flex flex-col h-full justify-end pt-[20px]">
                      <button className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                        Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table Header */}
                <div className="bg-[#F8FAFC] border-b border-gray-100 flex items-center px-6 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <div className="w-[12%]">Date</div>
                  <div className="w-[20%]">Description</div>
                  <div className="w-[15%]">Project</div>
                  <div className="w-[18%]">Type</div>
                  <div className="w-[12%] text-right">Amount</div>
                  <div className="w-[12%] pl-6">Status</div>
                  <div className="w-[11%] text-right">Balance</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100 bg-white">
                  {txWithBalance.length > 0 ? txWithBalance.map((tx) => {
                    let icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                    let iconBg = "bg-[#EEF2FF] text-[#4F46E5]"
                    let typeBadge = "Escrow Funded"
                    let typeColor = "text-[#10B981] bg-[#ECFDF5]"
                    let amountStr = `+ ₹${(tx.amount/100).toLocaleString()}`
                    let amountTextClass = "text-[#10B981]"

                    if (tx.type === "RELEASE") {
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      iconBg = "bg-[#ECFDF5] text-[#10B981]"
                      typeBadge = "Payment Released"
                      typeColor = "text-[#3B82F6] bg-[#EFF6FF]"
                      amountStr = `- ₹${(tx.amount/100).toLocaleString()}`
                      amountTextClass = "text-[#0F172A]"
                    } else if (tx.type === "REFUND") {
                      icon = <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      iconBg = "bg-[#FFFBEB] text-[#F59E0B]"
                      typeBadge = "Refund"
                      typeColor = "text-[#F59E0B] bg-[#FFFBEB]"
                      amountStr = `- ₹${(tx.amount/100).toLocaleString()}`
                      amountTextClass = "text-[#0F172A]"
                    }

                    return (
                      <div key={tx.id} className="flex items-center px-6 py-4 hover:bg-gray-50 transition-colors group">
                        <div className="w-[12%] flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                            {icon}
                          </div>
                          <div>
                            <div className="text-[12px] font-bold text-[#0F172A]">{tx.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            <div className="text-[10px] text-[#64748B]">{tx.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                        <div className="w-[20%] pr-4">
                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5 truncate">{tx.milestone.title}</div>
                          <div className="text-[11px] text-[#64748B] truncate">{tx.type === 'FUND' ? 'Escrow funded by you' : 'Released to freelancer'}</div>
                        </div>
                        <div className="w-[15%] pr-4">
                          <div className="text-[12px] font-bold text-[#0F172A] mb-0.5 truncate">{tx.project.title}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{tx.project.description}</div>
                        </div>
                        <div className="w-[18%] pr-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${typeColor}`}>{typeBadge}</span>
                        </div>
                        <div className={`w-[12%] text-right text-[12px] font-bold ${amountTextClass}`}>
                          {amountStr}
                        </div>
                        <div className="w-[12%] pl-6 flex items-center gap-1.5">
                           <svg width="12" height="12" fill="none" stroke="#10B981" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                           <span className="text-[11px] font-bold text-[#10B981]">Completed</span>
                        </div>
                        <div className="w-[11%] text-right flex items-center justify-end gap-2">
                          <span className="text-[12px] font-bold text-[#0F172A]">₹{(tx.balance/100).toLocaleString()}</span>
                          <button className="text-gray-400 hover:text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity p-1"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg></button>
                        </div>
                      </div>
                    )
                  }) : (
                    <div className="p-12 text-center text-sm text-gray-500 font-medium">No transactions found.</div>
                  )}
                </div>

                {/* Table Footer */}
                <div className="bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-between text-[13px] text-[#64748B] mt-auto">
                  <div>Showing 1 to {txWithBalance.length} of {txWithBalance.length} transactions</div>
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600" disabled><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Sidebar Widgets */}
              <div className="lg:w-[30%] flex flex-col gap-6">
                
                {/* Escrow Balance Donut */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Escrow Balance</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View Details <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="relative w-[110px] h-[110px] shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#F1F5F9" strokeWidth="3"></circle>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray={`${(inDispute/totalEscrowPool)*100} 100`} strokeDashoffset="0"></circle>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#D8B4FE" strokeWidth="3" strokeDasharray={`${pendingReleasePct} 100`} strokeDashoffset={`-${(inDispute/totalEscrowPool)*100}`}></circle>
                        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#4F46E5" strokeWidth="3" strokeDasharray={`${escrowAvailablePct} 100`} strokeDashoffset={`-${((inDispute/totalEscrowPool)*100) + pendingReleasePct}`}></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[16px] font-bold text-[#0F172A] leading-none mb-1">₹{(escrowBalance/100).toLocaleString()}</span>
                        <span className="text-[10px] text-[#64748B] font-medium">Total</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span><span className="text-[#0F172A] font-bold">Available</span></div>
                        <span className="font-medium text-[#64748B]">₹{(escrowBalance/100).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#D8B4FE]"></span><span className="text-[#0F172A] font-bold">Pending Release</span></div>
                        <span className="font-medium text-[#64748B]">₹{(pendingRelease/100).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#EF4444]"></span><span className="text-[#0F172A] font-bold">In Dispute</span></div>
                        <span className="font-medium text-[#64748B]">₹{(inDispute/100).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payout Account */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Payout Account</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">Manage <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[18px] font-bold text-[#0F172A] tracking-widest">•••• •••• •••• 4242</div>
                    <div className="text-[#1A1F71] font-bold text-xl italic font-serif">VISA</div>
                  </div>
                  
                  <div className="mb-5">
                    <div className="text-[12px] font-bold text-[#0F172A]">{user.name}</div>
                    <div className="text-[11px] text-[#64748B]">HDFC Bank • Savings</div>
                  </div>

                  <div className="flex flex-col gap-2 text-[11px] mb-4">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[#64748B]">Account Holder</span>
                      <span className="font-bold text-[#0F172A]">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">IFSC Code</span>
                      <span className="font-bold text-[#0F172A]">HDFC0001234</span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ECFDF5] text-[#10B981] rounded text-[10px] font-bold uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                {/* Recent Payouts */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[#0F172A] text-[15px]">Recent Payouts</h3>
                    <button className="text-[11px] font-bold text-[#4F46E5] hover:underline flex items-center gap-1">View All <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7l7 7-7 7"/></svg></button>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {recentPayouts.length > 0 ? recentPayouts.map(tx => {
                      const recipient = tx.project.clientId === user.id ? tx.project.freelancer : tx.project.client
                      return (
                        <div key={tx.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                               {recipient?.avatarUrl ? <img src={recipient.avatarUrl} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#4F46E5]"></div>}
                            </div>
                            <div>
                              <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">{recipient?.name || 'User'}</div>
                              <div className="text-[10px] text-[#64748B]">{tx.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold text-[#0F172A] mb-0.5">₹{(tx.amount/100).toLocaleString()}</div>
                            <div className="text-[9px] font-bold text-[#10B981]">Completed</div>
                          </div>
                        </div>
                      )
                    }) : (
                      <div className="text-center text-xs text-gray-500 py-2">No recent payouts.</div>
                    )}
                  </div>
                  
                  <button className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-[#4F46E5] hover:bg-gray-50 transition-colors">
                    View All Payouts
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
