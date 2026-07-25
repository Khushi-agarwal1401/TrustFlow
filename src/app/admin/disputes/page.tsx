import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminDisputesPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !user.roles.includes("ADMIN")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-canvas">
        <p className="text-text-secondary">Access denied — admin only</p>
      </div>
    )
  }

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      milestone: {
        include: { project: { select: { title: true } } },
      },
      opener: { select: { name: true, email: true } },
      _count: { select: { evidences: true } },
    },
  })

  return (
    <div className="min-h-screen bg-bg-canvas">
      <header className="border-b border-border-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">&larr; Dashboard</Link>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Admin — Disputes</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-card border border-border-surface bg-bg-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Milestone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Opened By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Evidence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} className="border-b border-border-surface last:border-b-0">
                  <td className="px-4 py-3 text-text-primary">{d.milestone.project.title}</td>
                  <td className="px-4 py-3 text-text-secondary">{d.milestone.title}</td>
                  <td className="px-4 py-3 text-text-primary">{d.opener.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-pill px-2 py-0.5 text-[10px] font-medium ${
                      d.status === "RESOLVED_ACCEPTED" || d.status === "RESOLVED_ADMIN"
                        ? "bg-state-success/10 text-state-success"
                        : d.status === "ESCALATED"
                          ? "bg-state-danger/10 text-state-danger"
                          : "bg-state-warning/10 text-state-warning"
                    }`}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{d._count.evidences}</td>
                  <td className="px-4 py-3 text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/disputes/${d.id}`}
                      className="text-accent-primary text-xs hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    No disputes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
