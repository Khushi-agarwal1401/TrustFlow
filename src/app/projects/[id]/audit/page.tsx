import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AuditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      freelancer: true,
    }
  })

  if (!project) return <div className="p-6 text-text-muted">Project not found</div>
  if (project.clientId !== session.user.id && project.freelancerId !== session.user.id) {
    return <div className="p-6 text-text-muted">Forbidden</div>
  }

  const events = await prisma.projectEvent.findMany({
    where: { projectId: id },
    include: {
      actor: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center gap-3">
        <Link href={`/projects/${id}`} className="text-text-secondary hover:text-text-primary transition">&larr; Back to Project</Link>
        <span className="text-text-muted">/</span>
        <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Audit Log</h1>
      </header>

      <div className="card-double animate-fade-up">
        <div className="card-inner p-8">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-poppins)" }}>Immutable Event Timeline</h2>
          
          <div className="space-y-6">
            {events.length === 0 ? (
              <p className="text-text-muted">No events recorded yet.</p>
            ) : (
              <div className="relative border-l border-border-subtle ml-3 space-y-8">
                {events.map((event) => (
                  <div key={event.id} className="relative pl-6">
                    <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-accent-primary ring-4 ring-bg-base" />
                    
                    <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-sm text-text-primary mr-2">
                            {event.eventType.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-text-muted">
                            by {event.actor?.name || event.actor?.email || "System"}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-text-muted">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {event.metadata && Object.keys(event.metadata as object).length > 0 && (
                        <div className="mt-3 p-3 bg-bg-base rounded-lg border border-border-subtle overflow-x-auto">
                          <pre className="text-[10px] text-text-secondary font-mono m-0">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
