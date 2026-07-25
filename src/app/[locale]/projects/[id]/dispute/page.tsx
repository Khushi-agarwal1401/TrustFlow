import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      freelancer: true,
      milestones: {
        include: {
          disputes: {
            include: {
              opener: true,
              evidences: {
                include: { submitter: true },
                orderBy: { createdAt: "asc" }
              }
            }
          }
        }
      },
    }
  })

  if (!project) return <div className="p-6">Project not found</div>
  if (project.clientId !== session.user.id && project.freelancerId !== session.user.id) {
    return <div className="p-6">Forbidden</div>
  }

  // Flatten disputes for this project
  const disputes = project.milestones.flatMap(m => m.disputes.map(d => ({ ...d, milestone: m })))

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`} className="text-text-secondary hover:text-text-primary transition">&larr; Back to Project</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-semibold truncate" style={{ fontFamily: "var(--font-poppins)" }}>Dispute Resolution</h1>
        </div>
      </header>

      {disputes.length === 0 ? (
        <div className="card-double animate-fade-up">
          <div className="card-inner p-12 text-center text-text-muted">
            No active disputes on this project.
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {disputes.map(dispute => (
            <div key={dispute.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up">
              {/* Left Column: Dispute Context */}
              <div className="card-double">
                <div className="card-inner p-6 space-y-6 h-full border-r border-border-subtle bg-bg-base">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold">Milestone: {dispute.milestone.title}</h2>
                      <span className="badge bg-danger/10 text-danger border border-danger/20">
                        {dispute.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary">Opened by {dispute.opener.name}</p>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-border-subtle">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-text-muted">Evidence & Statements</h3>
                    {dispute.evidences.map(ev => (
                      <div key={ev.id} className="p-4 bg-bg-elevated rounded-xl border border-border-subtle">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm text-text-primary">{ev.submitter.name}</span>
                          <span className="text-xs text-text-muted">{new Date(ev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">{ev.statement}</p>
                        {ev.fileUrls.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {ev.fileUrls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-accent-primary hover:underline">
                                Attachment {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Resolution */}
              <div className="card-double">
                <div className="card-inner p-6 h-full bg-bg-surface flex flex-col justify-center">
                  {dispute.aiSuggestedResolution ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                            <path d="M12 12 2.1 7.1" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-accent-primary">AI Suggested Resolution</h3>
                      </div>
                      
                      <div className="p-4 rounded-xl border border-accent-primary/30 bg-accent-primary/5">
                        <p className="text-sm text-text-primary leading-relaxed">
                          {(dispute.aiSuggestedResolution as { summary?: string } | null)?.summary || "Based on the evidence and contract terms, we suggest releasing the funds proportionally."}
                        </p>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button className="btn-ghost flex-1 text-sm border-border-strong">Reject Suggestion</button>
                        <button className="btn-primary flex-1 text-sm">Accept Resolution</button>
                      </div>
                      <p className="text-[10px] text-text-muted text-center">Accepting this resolution is binding.</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center mx-auto mb-2">
                        <div className="w-6 h-6 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <h3 className="font-medium text-text-primary">Analyzing Evidence</h3>
                      <p className="text-xs text-text-secondary">Our AI is reviewing the contract and provided evidence to suggest a resolution.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
