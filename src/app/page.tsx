import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotificationBell } from "@/components/notification-bell"
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
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-poppins)" }}>TrustFlow</h1>
          <p className="text-text-secondary text-sm">Welcome back, {user.name || user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {user.roles.includes("ADMIN") && (
            <Link href="/admin/disputes" className="btn-ghost text-xs">Admin Queue</Link>
          )}
          <NotificationBell />
          <Link href="/projects/new" className="btn-primary text-sm">+ New Project</Link>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4"><p className="text-2xl font-bold text-accent-primary">{activeCount}</p><p className="text-text-muted text-sm">Active</p></div>
        <div className="card p-4"><p className="text-2xl font-bold text-success">{completedCount}</p><p className="text-text-muted text-sm">Completed</p></div>
        <div className="card p-4"><p className="text-2xl font-bold text-warning">{awaitingCount}</p><p className="text-text-muted text-sm">Awaiting</p></div>
        <div className="card p-4"><p className="text-2xl font-bold text-text-primary">{allProjects.length}</p><p className="text-text-muted text-sm">Total</p></div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Projects</h2>
        {allProjects.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-text-muted">No projects yet</p>
            <Link href="/projects/new" className="btn-primary inline-block mt-4">Create your first project</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {allProjects.map((project) => {
              const statusColor = {
                DRAFT: "text-text-muted",
                AWAITING_ACCEPTANCE: "text-warning",
                AWAITING_FUNDING: "text-info",
                DECLINED: "text-danger",
                IN_PROGRESS: "text-accent-primary",
                COMPLETED: "text-success",
                DISPUTED: "text-danger",
                CANCELLED: "text-text-muted",
              }[project.status] || "text-text-muted"

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="card p-4 flex items-center justify-between hover:bg-bg-hover transition block"
                >
                  <div>
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-text-muted">
                      {project.freelancer ? `with ${project.freelancer.name}` : project.client ? `by ${project.client.name}` : ""}
                      {" · "}${(project.totalAmount / 100).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm font-medium capitalize ${statusColor}`}>
                    {project.status.replace(/_/g, " ").toLowerCase()}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
