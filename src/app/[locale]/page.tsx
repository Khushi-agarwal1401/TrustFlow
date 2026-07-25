import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotificationBell } from "@/components/notification-bell"
import { LanguageSwitcher } from "@/components/language-switcher"
import Link from "next/link"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      projectsAsClient: {
        include: { freelancer: true, client: true, milestones: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      projectsAsFreelancer: {
        include: { freelancer: true, client: true, milestones: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!user) redirect("/auth/signin")

  const allProjects = [...user.projectsAsClient, ...user.projectsAsFreelancer]

  const activeCount = allProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING").length
  const completedCount = allProjects.filter((p) => p.status === "COMPLETED").length
  const awaitingCount = allProjects.filter((p) => p.status === "AWAITING_ACCEPTANCE").length

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <header className="glass-strong rounded-2xl px-6 py-3 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <h1 className="text-lg font-bold" style={{ fontFamily: "var(--font-poppins)" }}>TrustFlow</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {user.roles.includes("ADMIN") && (
            <Link href="/admin/disputes" className="btn-ghost text-xs">Admin</Link>
          )}
          <Link href="/marketplace" className="btn-ghost text-xs">Marketplace</Link>
          <Link href="/analytics" className="btn-ghost text-xs">Analytics</Link>
          <NotificationBell />
          <Link href="/projects/new" className="btn-primary text-sm">+ New Project</Link>
        </div>
      </header>

      <div className="mb-6">
        <p className="text-text-secondary text-sm">Welcome back, <span className="text-text-primary font-medium">{user.name || user.email}</span></p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active", value: activeCount, color: "text-accent-primary", delay: "stagger-1" },
          { label: "Completed", value: completedCount, color: "text-success", delay: "stagger-2" },
          { label: "Awaiting", value: awaitingCount, color: "text-warning", delay: "stagger-3" },
          { label: "Total", value: allProjects.length, color: "text-text-primary", delay: "stagger-4" },
        ].map((stat) => (
          <div key={stat.label} className={`card-double animate-fade-up ${stat.delay}`}>
            <div className="card-inner">
              <p className={`text-3xl font-bold ${stat.color} tabular-nums`} style={{ fontFamily: "var(--font-poppins)" }}>{stat.value}</p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="animate-fade-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-poppins)" }}>Projects</h2>
          <div className="flex items-center gap-2">
            <Link href="/marketplace" className="btn-ghost text-xs">Browse Marketplace</Link>
          </div>
        </div>
        {allProjects.length === 0 ? (
          <div className="card-double">
            <div className="card-inner text-center py-12">
              <p className="text-text-muted">No projects yet</p>
              <Link href="/projects/new" className="btn-primary inline-block mt-4">Create your first project</Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {allProjects.map((project, i) => {
              const statusColor: Record<string, string> = {
                DRAFT: "text-text-muted", AWAITING_ACCEPTANCE: "text-warning", AWAITING_FUNDING: "text-info",
                DECLINED: "text-danger", IN_PROGRESS: "text-accent-primary", COMPLETED: "text-success",
                DISPUTED: "text-danger", CANCELLED: "text-text-muted",
              }

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`card-double block transition-all duration-200 hover:border-accent-primary/30 animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <div className="card-inner flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary truncate">{project.title}</h3>
                      <p className="text-sm text-text-muted mt-0.5">
                        {project.freelancer ? `with ${project.freelancer.name}` : project.client ? `by ${project.client.name}` : ""}
                        {" · "}${(project.totalAmount / 100).toLocaleString()}
                        {" · "}{project.milestones.length} milestone{project.milestones.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`badge border border-current/20 ${statusColor[project.status] || "text-text-muted"}`}>
                      {project.status.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
