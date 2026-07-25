import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProjectActions } from "./project-actions"

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { sequence: "asc" } },
      contract: true,
      freelancer: true,
      client: true,
      riskSignals: { orderBy: { computedAt: "desc" }, take: 5 },
    },
  })

  if (!project) return <div className="p-6 text-text-muted">Project not found</div>

  const isClient = project.clientId === session.user.id

  const latestRisk = project.riskSignals[0]

  const statusColor: Record<string, string> = {
    DRAFT: "text-text-muted",
    AWAITING_ACCEPTANCE: "text-warning",
    AWAITING_FUNDING: "text-info",
    DECLINED: "text-danger",
    IN_PROGRESS: "text-accent-primary",
    COMPLETED: "text-success",
    DISPUTED: "text-danger",
    CANCELLED: "text-text-muted",
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>{project.title}</h1>
          <p className="text-text-secondary mt-1">{project.description}</p>
        </div>
        <span className={`text-sm font-medium capitalize ${statusColor[project.status]}`}>
          {project.status.replace(/_/g, " ").toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold mb-3">Milestones ({project.milestones.length})</h2>
            <div className="space-y-3">
              {project.milestones.map((m, i) => {
                const msColor = {
                  PENDING: "text-text-muted",
                  FUNDED: "text-info",
                  SUBMITTED: "text-warning",
                  IN_REVIEW: "text-warning",
                  REVISION_REQUESTED: "text-danger",
                  APPROVED: "text-success",
                  PAID: "text-success",
                  DISPUTED: "text-danger",
                }[m.status] || "text-text-muted"

                return (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {i + 1}. {m.title}
                      </p>
                      <p className={`text-xs ${msColor}`}>{m.status.replace(/_/g, " ").toLowerCase()}</p>
                      <p className="text-xs text-text-muted mt-1">{m.deliverableDescription}</p>
                    </div>
                    <span className="text-sm font-medium">${(m.amount / 100).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {project.contract?.aiGeneratedDraft && (
            <div className="card p-4">
              <h2 className="font-semibold mb-2">Terms</h2>
              <p className="text-sm text-text-secondary">
                {(project.contract.aiGeneratedDraft as { terms?: string }).terms || "No terms defined"}
              </p>
            </div>
          )}

          {project.status === "DRAFT" && isClient && (
            <ProjectActions projectId={project.id} />
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Budget</span>
                <span className="font-medium">${(project.totalAmount / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Client</span>
                <span>{project.client.name || project.client.email}</span>
              </div>
              {project.freelancer && (
                <div className="flex justify-between">
                  <span className="text-text-muted">Freelancer</span>
                  <span>{project.freelancer.name}</span>
                </div>
              )}
            </div>
          </div>

          {latestRisk && (
            <div className={`card p-4 border-l-4 ${latestRisk.level === "RED" ? "border-danger" : latestRisk.level === "AMBER" ? "border-warning" : "border-success"}`}>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Risk Status</h3>
              <span className={`font-bold text-lg ${
                latestRisk.level === "RED" ? "text-danger" : latestRisk.level === "AMBER" ? "text-warning" : "text-success"
              }`}>{latestRisk.level}</span>
              {latestRisk.reason && (
                <p className="mt-2 text-xs text-text-secondary">{latestRisk.reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
