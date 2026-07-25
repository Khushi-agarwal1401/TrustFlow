import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      roles: true,
      createdAt: true,
    },
  })

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-bg-canvas"><p className="text-text-secondary">User not found</p></div>
  }

  const completedProjects = await prisma.project.count({
    where: { OR: [{ clientId: id }, { freelancerId: id }], status: "COMPLETED" },
  })

  const totalProjects = await prisma.project.count({
    where: { OR: [{ clientId: id }, { freelancerId: id }] },
  })

  const disputesAsParty = await prisma.dispute.count({
    where: { milestone: { project: { OR: [{ clientId: id }, { freelancerId: id }] } } },
  })

  const ratings = await prisma.rating.findMany({
    where: { ratedUser: id },
    select: { score: true, comment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-bg-canvas">
      <header className="border-b border-border-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">&larr; Dashboard</Link>
          <h1 className="font-heading text-2xl font-bold text-text-primary">{user.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-card border border-border-surface bg-bg-surface p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide">Completed</p>
            <p className="mt-1 font-heading text-3xl font-bold text-text-primary tabular-nums">{completedProjects}</p>
          </div>
          <div className="rounded-card border border-border-surface bg-bg-surface p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide">Total Projects</p>
            <p className="mt-1 font-heading text-3xl font-bold text-text-primary tabular-nums">{totalProjects}</p>
          </div>
          <div className="rounded-card border border-border-surface bg-bg-surface p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide">Rating</p>
            <p className="mt-1 font-heading text-3xl font-bold text-text-primary tabular-nums">
              {avgRating ?? "—"}
            </p>
          </div>
          <div className="rounded-card border border-border-surface bg-bg-surface p-6">
            <p className="text-xs text-text-muted uppercase tracking-wide">Disputes</p>
            <p className="mt-1 font-heading text-3xl font-bold text-text-primary tabular-nums">{disputesAsParty}</p>
          </div>
        </div>

        {ratings.length > 0 && (
          <div className="mt-6 rounded-card border border-border-surface bg-bg-surface p-6">
            <h2 className="font-heading text-lg font-semibold text-text-primary">Recent Ratings</h2>
            <div className="mt-4 space-y-3">
              {ratings.map((r, i) => (
                <div key={i} className="rounded-button border border-border-surface p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-state-warning">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                    <span className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-text-secondary">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {ratings.length === 0 && (
          <div className="mt-6 rounded-card border border-border-surface bg-bg-surface p-8 text-center">
            <p className="text-sm text-text-muted">No ratings yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
