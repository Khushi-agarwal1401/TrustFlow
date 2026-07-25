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
    return <div className="flex min-h-screen items-center justify-center bg-[#0B0A1F]"><p className="text-gray-300">User not found</p></div>
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
    <div className="min-h-screen bg-[#0B0A1F]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <Link href="/" className="text-sm text-gray-500 hover:text-white">&larr; Dashboard</Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-poppins)" }}>{user.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-poppins)" }}>{completedProjects}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Projects</p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-poppins)" }}>{totalProjects}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Rating</p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-poppins)" }}>
              {avgRating ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#14132A] p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Disputes</p>
            <p className="mt-1 text-3xl font-bold text-white tabular-nums" style={{ fontFamily: "var(--font-poppins)" }}>{disputesAsParty}</p>
          </div>
        </div>

        {ratings.length > 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-[#14132A] p-6">
            <h2 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-poppins)" }}>Recent Ratings</h2>
            <div className="mt-4 space-y-3">
              {ratings.map((r, i) => (
                <div key={i} className="rounded-lg border border-white/10 p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5 - r.score)}</span>
                    <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-1 text-sm text-gray-300">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {ratings.length === 0 && (
          <div className="mt-6 rounded-xl border border-white/10 bg-[#14132A] p-8 text-center">
            <p className="text-sm text-gray-500">No ratings yet</p>
          </div>
        )}
      </main>
    </div>
  )
}
