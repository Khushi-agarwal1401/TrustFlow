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
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="card-double"><div className="card-inner text-center py-8 px-12">
          <p className="text-text-secondary">Access denied — admin only</p>
          <Link href="/" className="btn-ghost text-sm mt-4 inline-block">Back to Dashboard</Link>
        </div></div>
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
    <div className="max-w-7xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition">&larr; Dashboard</Link>
          <span className="text-text-muted">/</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>Admin — Disputes</h1>
        </div>
        <span className="badge bg-accent-subtle text-accent-primary">{disputes.length} total</span>
      </header>

      <div className="card-double animate-fade-up stagger-1 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Project</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Milestone</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Opened By</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Evidence</th>
                <th className="px-5 py-3.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {disputes.map((d, i) => (
                <tr key={d.id} className={`border-b border-border-subtle last:border-b-0 transition-colors hover:bg-bg-hover/50 animate-fade-up stagger-${Math.min(i + 1, 6)}`}>
                  <td className="px-5 py-4 text-text-primary font-medium">{d.milestone.project.title}</td>
                  <td className="px-5 py-4 text-text-secondary">{d.milestone.title}</td>
                  <td className="px-5 py-4 text-text-primary">{d.opener.name}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      d.status === "RESOLVED_ACCEPTED" || d.status === "RESOLVED_ADMIN"
                        ? "bg-success/10 text-success"
                        : d.status === "ESCALATED"
                          ? "bg-danger/10 text-danger"
                          : "bg-warning/10 text-warning"
                    }`}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-text-muted tabular-nums">{d._count.evidences}</td>
                  <td className="px-5 py-4 text-text-muted">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/disputes/${d.id}`}
                      className="text-accent-primary text-xs hover:underline font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {disputes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                    No disputes yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
