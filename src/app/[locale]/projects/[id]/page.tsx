import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProjectActions } from "./project-actions"
import { MilestoneActions } from "./milestone-actions"
import { DeadlinePredict } from "./deadline-predict"
import { ProgressReport } from "./progress-report"
import { RiskHistory } from "./risk-history"
import { ReplaceFreelancer } from "./replace-freelancer"
import Link from "next/link"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { 
        orderBy: { sequence: "asc" },
        include: {
          submissions: {
            orderBy: { submittedAt: "desc" },
            take: 1,
            include: { aiReview: true }
          }
        }
      },
      contract: true,
      freelancer: true,
      client: true,
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      riskSignals: { orderBy: { computedAt: "desc" }, take: 5 },
    },
  })

  if (!project) return <div className="p-6 text-text-muted">Project not found</div>

  const isClient = project.clientId === session.user.id
  const isFreelancer = project.freelancerId === session.user.id
  const latestRisk = project.riskSignals[0]

  const milestoneSnaps = project.milestones.map(m => ({
    title: m.title,
    status: m.status
  }))

  const statusColor: Record<string, string> = {
    DRAFT: "text-text-muted", AWAITING_ACCEPTANCE: "text-warning", AWAITING_FUNDING: "text-info",
    DECLINED: "text-danger", IN_PROGRESS: "text-accent-primary", COMPLETED: "text-success",
    DISPUTED: "text-danger", CANCELLED: "text-text-muted",
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-semibold truncate" style={{ fontFamily: "var(--font-poppins)" }}>{project.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge border border-current/20 ${statusColor[project.status]}`}>
            {project.status.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-double animate-fade-up stagger-1">
            <div className="card-inner space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Milestones</h2>
                <div className="flex items-center gap-2">
                  {isClient && <DeadlinePredict projectId={id} />}
                  <span className="badge bg-bg-elevated text-text-secondary">{project.milestones.length} total</span>
                </div>
              </div>
              <div className="space-y-3">
                {project.milestones.map((m, i) => {
                  const msColor: Record<string, string> = {
                    PENDING: "bg-text-muted", FUNDED: "bg-info", SUBMITTED: "bg-warning",
                    IN_REVIEW: "bg-warning", REVISION_REQUESTED: "bg-danger",
                    APPROVED: "bg-success", PAID: "bg-success", DISPUTED: "bg-danger",
                  }

                  return (
                    <div key={m.id} className="card-elevated rounded-xl p-4 transition-all duration-200 hover:border-accent-primary/20">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-3 h-3 rounded-full ${msColor[m.status] || "bg-text-muted"} ${m.status === "APPROVED" || m.status === "PAID" ? "ring-2 ring-success/30" : ""}`} />
                          {i < project.milestones.length - 1 && <div className="w-px h-8 bg-border-subtle" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{m.title}</p>
                            <span className="text-sm font-medium">${(m.amount / 100).toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{m.deliverableDescription}</p>
                          <span className={`badge text-[10px] mt-1.5 ${msColor[m.status] ? `bg-${msColor[m.status]}/10 text-${msColor[m.status]}` : "bg-text-muted/10 text-text-muted"}`}>
                            {m.status.replace(/_/g, " ").toLowerCase()}
                          </span>
                          {m.revisionCount > 0 && (
                            <span className="text-[10px] text-text-muted ml-2">{m.revisionCount} revision{m.revisionCount !== 1 ? "s" : ""}</span>
                          )}

                          {m.submissions?.[0]?.aiReview && (
                            <div className="mt-4 p-3 rounded-lg border border-border-subtle bg-bg-base">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-accent-primary flex items-center gap-1">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12 2.1 7.1"/></svg>
                                  AI Summary
                                </span>
                                <span className={`badge ${m.submissions[0].aiReview.confidence === 'HIGH' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                  {m.submissions[0].aiReview.confidence === 'HIGH' ? 'High Confidence' : 'Needs your review'}
                                </span>
                              </div>
                              <p className="text-xs text-text-secondary leading-relaxed">{m.submissions[0].aiReview.matchSummary}</p>
                              <p className="text-[10px] text-text-muted mt-2">AI-generated — review before relying on it</p>
                            </div>
                          )}
                          
                          {m.submissions?.[0] && (
                            <div className="mt-3 p-3 rounded-lg border border-border-subtle bg-bg-base space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Submission</span>
                                <span className="text-[10px] text-text-muted">{new Date(m.submissions[0].submittedAt).toLocaleDateString()}</span>
                              </div>
                              {m.submissions[0].fileUrls.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {m.submissions[0].fileUrls.map((url: string, fi: number) => (
                                    <a key={fi} href={url} target="_blank" className="text-[10px] text-accent-primary hover:underline bg-accent-subtle px-2 py-0.5 rounded">
                                      File {fi + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                              {m.submissions[0].linkEvidence && Array.isArray(m.submissions[0].linkEvidence) && (
                                <div className="space-y-1">
                                  {(m.submissions[0].linkEvidence as { label: string; url: string }[]).map((link: { label: string; url: string }, li: number) => (
                                    <a key={li} href={link.url} target="_blank" className="block text-[10px] text-accent-primary hover:underline">
                                      {link.label || link.url}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {isClient && m.status === "SUBMITTED" && (
                            <MilestoneActions milestoneId={m.id} milestoneStatus={m.status} isClient={isClient} />
                          )}

                          {isFreelancer && m.status === "REVISION_REQUESTED" && (
                            <div className="mt-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
                              <p className="text-xs text-warning font-medium">Revision requested — please update and resubmit</p>
                            </div>
                          )}

                          {isFreelancer && m.status === "PENDING" && (
                            <Link
                              href={`/projects/${id}/submit/${m.id}`}
                              className="inline-block mt-2 text-xs text-accent-primary hover:underline font-medium"
                            >
                              Submit Work →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {project.contract?.aiGeneratedDraft && (
            <div className="card-double animate-fade-up stagger-2">
              <div className="card-inner">
                <h2 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Terms</h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {(project.contract.aiGeneratedDraft as { terms?: string }).terms || "No terms defined"}
                </p>
              </div>
            </div>
          )}

          {isClient && (project.status === "DRAFT" || project.status === "AWAITING_ACCEPTANCE") && (
            <div className="animate-fade-up stagger-3">
              <ProjectActions projectId={project.id} />
              {project.freelancer && (
                <div className="mt-3">
                  <ReplaceFreelancer projectId={id} isClient={isClient} hasFreelancer={!!project.freelancer} />
                </div>
              )}
            </div>
          )}

          {project.messages && project.messages.length > 0 && (
            <div className="card-double animate-fade-up stagger-3">
              <div className="card-inner">
                <h2 className="font-semibold mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Messages</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-2">
                  {[...project.messages].reverse().map((msg) => (
                    <div key={msg.id} className="card-elevated rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                        <span className="font-medium text-text-secondary">{msg.sender.name}</span>
                        <span>·</span>
                        <span>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-text-primary">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card-double animate-fade-up stagger-2">
            <div className="card-inner space-y-3">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Details</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Budget</span>
                  <span className="font-semibold">${(project.totalAmount / 100).toLocaleString()}</span>
                </div>
                <div className="border-t border-border-subtle" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Client</span>
                  <span className="font-medium">{project.client.name || project.client.email}</span>
                </div>
                {project.freelancer && (
                  <>
                    <div className="border-t border-border-subtle" />
                    <div className="flex justify-between">
                      <span className="text-text-muted">Freelancer</span>
                      <span className="font-medium">{project.freelancer.name}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-border-subtle" />
                <div className="flex justify-between">
                  <span className="text-text-muted">Created</span>
                  <span className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="border-t border-border-subtle pt-3">
                <ProgressReport
                  projectId={id}
                  projectTitle={project.title}
                  milestones={milestoneSnaps}
                />
              </div>
            </div>
          </div>

          <div className="card-double animate-fade-up stagger-3">
            <div className="card-inner">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Risk</h3>
                {latestRisk && (
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${latestRisk.level === "RED" ? "bg-danger" : latestRisk.level === "AMBER" ? "bg-warning" : "bg-success"}`} />
                    <span className={`badge ${latestRisk.level === "RED" ? "bg-danger/10 text-danger" : latestRisk.level === "AMBER" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                      {latestRisk.level}
                    </span>
                  </div>
                )}
              </div>
              {latestRisk?.reason && (
                <p className="text-xs text-text-secondary leading-relaxed mb-3">{latestRisk.reason}</p>
              )}
              <RiskHistory projectId={id} />
            </div>
          </div>

          <div className="card-double animate-fade-up stagger-4">
            <div className="card-inner">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-poppins)" }}>Quick Links</h3>
              <div className="space-y-2">
                <Link href={`/projects/${id}/contract`} className="block text-sm text-accent-primary hover:underline">View Contract</Link>
                <Link href={`/projects/${id}/fund`} className="block text-sm text-accent-primary hover:underline">Fund Milestones</Link>
                <Link href={`/projects/${id}/legal`} className="block text-sm text-accent-primary hover:underline">Legal & Signatures</Link>
                {isFreelancer && (
                  <Link href={`/projects/${id}/proposals`} className="block text-sm text-accent-primary hover:underline">Proposals</Link>
                )}
                <Link href="/disputes" className="block text-sm text-danger hover:underline">View Disputes</Link>
                <Link href="/settings/audit-log" className="block text-sm text-accent-primary hover:underline">Audit Log</Link>
                <Link href="/settings/notifications" className="block text-sm text-accent-primary hover:underline">Notifications</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
