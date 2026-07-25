import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EscrowStatus } from "@prisma/client"
import Link from "next/link"
import { AppLayout } from "@/components/layout/app-layout"
import { Card } from "@/components/ui/card"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsClient: {
        include: { freelancer: true, client: true, contract: { select: { id: true } }, milestones: { orderBy: { sequence: 'asc' } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      projectsAsFreelancer: {
        include: { freelancer: true, client: true, contract: { select: { id: true } }, milestones: { orderBy: { sequence: 'asc' } } },
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
      status: { in: [EscrowStatus.PENDING, EscrowStatus.SUCCEEDED] },
    },
  })
  const escrowProtected = escrowTransactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFunded = escrowTransactions
    .filter((t) => t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + t.amount, 0)

  // Escrow trend (compare to last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const previousEscrowAmount = await prisma.escrowTransaction.aggregate({
    where: {
      milestone: { project: { OR: [{ clientId: user.id }, { freelancerId: user.id }] } },
      createdAt: { lt: thirtyDaysAgo },
    },
    _sum: { amount: true },
  })
  const previousTotal = previousEscrowAmount._sum.amount || 0
  const escrowChangePercent = previousTotal > 0
    ? Math.round(((escrowProtected + totalFunded - previousTotal) / previousTotal) * 100)
    : 100

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
  const ratingScore = avgRating ? (avgRating / 5) * 100 : 70
  
  const totalDisputes = await prisma.dispute.count({
    where: { milestone: { project: { OR: [{ clientId: user.id }, { freelancerId: user.id }] } } },
  })
  const disputeRate = allProjects.length > 0 ? (totalDisputes / allProjects.length) * 100 : 0
  const disputePenalty = Math.min(disputeRate * 10, 50)
  const aiTrustScore = Math.round(
    milestoneCompletionRate * 0.5 + ratingScore * 0.3 + (100 - disputePenalty) * 0.2
  )

  // ── Current Phase ──
  const currentProject = allProjects.find((p) =>
    ["DRAFT", "AWAITING_ACCEPTANCE", "AWAITING_FUNDING", "IN_PROGRESS", "DISPUTED"].includes(p.status)
  ) || null

  const phaseLabels: Record<string, { label: string; action: string }> = {
    DRAFT: { label: "draft", action: "Review & send to freelancer" },
    AWAITING_ACCEPTANCE: { label: "awaiting_acceptance", action: "Waiting for freelancer to accept" },
    AWAITING_FUNDING: { label: "funding", action: "Fund escrow to start the project" },
    IN_PROGRESS: { label: "in_progress", action: "Track milestone progress" },
    DISPUTED: { label: "disputed", action: "Resolve dispute to continue" },
  }

  const currentPhase = currentProject ? {
    title: currentProject.title,
    status: currentProject.status,
    role: currentProject.clientId === user.id ? ("client" as const) : ("freelancer" as const),
    phase: phaseLabels[currentProject.status]?.label || "in_progress",
    nextAction: phaseLabels[currentProject.status]?.action || "Track progress",
  } : null

  // ── Milestone Progress ──
  const pendingMilestones = allMilestones.filter(m => m.status === "PENDING").length

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
    <AppLayout user={user}>
      <div className="flex flex-col xl:flex-row max-w-[1600px] mx-auto p-8 gap-8">
        
        {/* LEFT 70% MAIN */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Hero */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight mb-1" style={{ fontFamily: "var(--font-poppins)" }}>
                Welcome back, {user.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)]">Here's what's happening with your projects today.</p>
            </div>
            <Link href="/projects/new" className="btn-primary flex items-center gap-2">
              + New Project
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </Link>
          </div>

          {/* Metric Cards Row with Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up stagger-1">
            <Card variant="double">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                Escrow Protected
              </div>
              <div className="mt-auto">
                <div className="text-[28px] font-bold tracking-tight tabular-nums">₹{escrowProtected.toLocaleString()}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[var(--color-text-secondary)]">Across {escrowTransactions.filter(t => t.status === "PENDING").length || activeProjects.length} escrow{escrowTransactions.filter(t => t.status === "PENDING").length !== 1 ? 's' : ''}</span>
                  <span className="text-xs font-bold text-[var(--color-success)]">↑ {escrowChangePercent}%</span>
                </div>
              </div>
            </Card>

            <Card variant="double">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg></div>
                AI Trust Score
              </div>
              <div className="mt-auto">
                <div className="text-[28px] font-bold tracking-tight tabular-nums">{aiTrustScore}%</div>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs font-bold ${aiTrustScore >= 80 ? 'text-[var(--color-success)]' : aiTrustScore >= 50 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}>
                    {aiTrustScore >= 80 ? 'Excellent' : aiTrustScore >= 50 ? 'Needs Review' : 'Critical'}
                  </span>
                </div>
              </div>
            </Card>

            <Card variant="double">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                Current Phase
              </div>
              <div className="mt-auto">
                <div className="text-[18px] font-bold tracking-tight truncate">{currentPhase?.title || "No active project"}</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1 truncate">{currentPhase?.nextAction || "Create a project to get started"}</div>
                {currentPhase && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`badge ${currentPhase.role === 'client' ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]'}`}>{currentPhase.role === 'client' ? 'Client' : 'Freelancer'}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{currentPhase.status.replace(/_/g, ' ')}</span>
                  </div>
                )}
                <div className="w-full bg-[var(--color-bg-elevated)] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[var(--color-accent-primary)] h-full rounded-full transition-all duration-700" style={{ width: `${milestoneCompletionRate}%` }}></div>
                </div>
              </div>
            </Card>

            <Card variant="double">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                Milestone Progress
              </div>
              <div className="mt-auto flex items-end justify-between">
                <div>
                  <div className="text-[28px] font-bold tracking-tight tabular-nums">{completedMilestonesCount} / {totalMilestonesCount}</div>
                  <div className="text-xs text-[var(--color-text-secondary)] mt-1">{milestoneCompletionRate}% completed</div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-[var(--color-bg-elevated)] flex items-center justify-center relative">
                   <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-[var(--color-accent-primary)]" strokeDasharray={`${milestoneCompletionRate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                   </svg>
                </div>
              </div>
            </Card>
          </div>

          {/* AI Project Health Banner */}
          <Card variant="glass" className="relative overflow-hidden animate-fade-up stagger-2 border-[var(--color-border-subtle)]">
            <div className="absolute right-0 top-0 h-full w-1/3 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, var(--color-accent-primary) 0%, transparent 70%)' }}></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>AI Project Health</h3>
                {isHealthy ? (
                  <span className="badge bg-[var(--color-success-subtle)] text-[var(--color-success)] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]"></div>Healthy</span>
                ) : (
                  <span className="badge bg-[var(--color-warning-subtle)] text-[var(--color-warning)] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]"></div>Risks Detected</span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">{isHealthy ? "Everything looks good. No risk signals detected." : "AI has detected potential risks in your active projects."}</p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-success-subtle)] text-[var(--color-success)] flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Contract</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{allProjects.some(p => p.contract !== null) ? 'Accepted' : 'Pending'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full ${totalFunded > 0 ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]'} flex items-center justify-center`}><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Escrow</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{totalFunded > 0 ? 'Funded' : 'Pending'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full ${pendingMilestones > 0 ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]' : 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'} flex items-center justify-center`}>
                    {pendingMilestones > 0
                      ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      : <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                    }
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Next Milestone</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{pendingMilestones > 0 ? `${pendingMilestones} pending` : 'All completed'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full ${riskSignals.length > 0 ? 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]' : 'bg-[var(--color-success-subtle)] text-[var(--color-success)]'} flex items-center justify-center`}>
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--color-text-primary)]">Risk Signals</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{riskSignals.length} detected</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Projects List */}
          <div className="animate-fade-up stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[17px] font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>Active Projects</h3>
              <Link href="/projects" className="text-[var(--color-accent-primary)] text-[13px] font-semibold hover:underline">View all projects</Link>
            </div>
            
            <div className="flex flex-col gap-4">
              {activeProjects.map((project) => (
                <Card key={project.id} variant="default" className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center font-bold text-lg">{project.title.charAt(0)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[var(--color-text-primary)]">{project.title}</h4>
                          <span className="badge bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)]">{project.status === 'IN_PROGRESS' ? 'Active' : project.status.replace(/_/g, ' ')}</span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">By {project.client?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--color-text-primary)] tabular-nums">₹{project.totalAmount.toLocaleString()}</div>
                      <p className="text-[11px] text-[var(--color-text-secondary)]">Total Budget</p>
                    </div>
                  </div>

                  {/* Timeline Graphic */}
                  <div className="py-6 px-2 mb-4 relative">
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[var(--color-border-default)] -translate-y-1/2 z-0"></div>
                    <div className="absolute top-1/2 left-0 h-[2px] bg-[var(--color-success)] -translate-y-1/2 z-0 transition-all duration-700" style={{ width: `${project.milestones.filter(m => m.status === 'APPROVED' || m.status === 'PAID').length / Math.max(project.milestones.length, 1) * 100}%` }}></div>
                    <div className="relative z-10 flex justify-between items-center w-full">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-success)] text-white flex items-center justify-center"><svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
                        <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">Contract</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-5 h-5 rounded-full ${project.status === 'AWAITING_FUNDING' ? 'bg-[var(--color-bg-surface)] border-2 border-[var(--color-accent-primary)]' : 'bg-[var(--color-success)] text-white'} flex items-center justify-center transition-colors`}>
                          {project.status !== 'AWAITING_FUNDING' ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> : <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]"></div>}
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">Escrow</span>
                      </div>
                      {project.milestones.map((m, i) => {
                        const isComplete = m.status === "APPROVED" || m.status === "PAID"
                        const isActive = m.status === "SUBMITTED" || m.status === "IN_REVIEW"
                        return (
                          <div key={m.id} className="flex flex-col items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isComplete ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white' : 
                              isActive ? 'bg-[var(--color-bg-surface)] border-[var(--color-accent-primary)]' : 
                              m.status === "DISPUTED" ? 'bg-[var(--color-danger-subtle)] border-[var(--color-danger)] text-[var(--color-danger)]' :
                              'bg-[var(--color-bg-surface)] border-[var(--color-border-strong)]'
                            }`}>
                              {isComplete ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg> : 
                               m.status === "DISPUTED" ? <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg> :
                               isActive ? <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)]"></div> :
                               <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-border-strong)]"></div>}
                            </div>
                            <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">MS {i + 1}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Footer Details */}
                  <div className="grid grid-cols-4 gap-4 border-t border-[var(--color-border-subtle)] pt-4">
                    <div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mb-1">Freelancer</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                          {project.freelancer?.avatarUrl ? <img src={project.freelancer.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[var(--color-border-strong)]"></div>}
                        </div>
                        <span className="text-xs font-semibold text-[var(--color-text-primary)]">{project.freelancer?.name || "Not assigned"}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mb-1">Next Due</p>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] tabular-nums">
                        {project.milestones.find(m => m.status === "PENDING")?.dueDate 
                          ? new Date(project.milestones.find(m => m.status === "PENDING")!.dueDate!).toLocaleDateString() 
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mb-1">AI Match</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--color-text-primary)] tabular-nums">{aiTrustScore}%</span>
                        <div className="w-16 h-1 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all duration-700 ${aiTrustScore >= 80 ? 'bg-[var(--color-success)]' : aiTrustScore >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`} style={{ width: `${aiTrustScore}%` }}></div></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-center">
                      <Link href={`/projects/${project.id}`} className="btn-primary text-xs py-1.5 px-4 h-auto">Review Now</Link>
                    </div>
                  </div>
                </Card>
              ))}
              {activeProjects.length === 0 && <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No active projects.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT 30% WIDGETS */}
        <aside className="w-full xl:w-[340px] shrink-0 flex flex-col gap-8 animate-fade-up stagger-4">
          
          {/* Notifications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>Notifications</h3>
              <Link href="/notifications" className="text-[var(--color-accent-primary)] text-xs font-semibold hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.map((notif) => (
                <Card key={notif.id} variant="default" className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] flex items-center justify-center shrink-0"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{notif.type}</h4>
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{Math.round((Date.now() - new Date(notif.createdAt).getTime()) / 3600000)}h ago</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{(notif.payload as Record<string, unknown> | null)?.message as string || notif.type}</p>
                  </div>
                </Card>
              ))}
              {notifications.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No new notifications.</p>}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>Upcoming Milestones</h3>
              <Link href="/milestones" className="text-[var(--color-accent-primary)] text-xs font-semibold hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {upcomingMilestones.map((m) => (
                <Card key={m.id} variant="default" className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{m.title}</h4>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{m.project.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[var(--color-text-secondary)] mb-0.5">Due in</div>
                      <div className="text-xs font-bold text-[var(--color-warning)]">{m.dueDate ? Math.max(1, Math.round((new Date(m.dueDate).getTime() - Date.now()) / 86400000)) : '—'} days</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[var(--color-text-primary)]">₹{m.amount.toLocaleString()} <span className="text-[var(--color-text-secondary)] font-normal">of ₹{m.project.totalAmount.toLocaleString()}</span></span>
                    <span className="text-[var(--color-text-secondary)]">{Math.round((m.amount / m.project.totalAmount) * 100)}%</span>
                  </div>
                  <div className="w-full h-1 bg-[var(--color-bg-elevated)] rounded-full mt-1.5 overflow-hidden"><div className="w-1/4 h-full bg-[var(--color-accent-primary)]"></div></div>
                </Card>
              ))}
              {upcomingMilestones.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No upcoming milestones.</p>}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>Recent Activity</h3>
              <Link href="/activity" className="text-[var(--color-accent-primary)] text-xs font-semibold hover:underline">View all</Link>
            </div>
            <div className="flex flex-col gap-3">
              {projectEvents.map((evt) => (
                <Card key={evt.id} variant="default" className="p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0 text-[var(--color-text-muted)]"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--color-text-primary)] truncate">{evt.eventType.replace(/_/g, ' ')}</h4>
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{Math.round((Date.now() - new Date(evt.createdAt).getTime()) / 3600000)}h ago</span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 truncate">{evt.project.title}</p>
                  </div>
                </Card>
              ))}
              {projectEvents.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">No recent activity.</p>}
            </div>
          </div>

        </aside>
      </div>
    </AppLayout>
  )
}
