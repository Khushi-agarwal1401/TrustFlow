import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const allProjects = await prisma.project.findMany({
    where: { OR: [{ clientId: user!.id }, { freelancerId: user!.id }] },
    include: { milestones: true },
  })

  const active = allProjects.filter((p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING")
  const completed = allProjects.filter((p) => p.status === "COMPLETED")
  const disputed = allProjects.filter((p) => p.status === "DISPUTED")

  const totalRevenue = completed.reduce((sum, p) => sum + p.totalAmount, 0)
  const activeRevenue = active.reduce((sum, p) => sum + p.totalAmount, 0)

  const totalMilestones = allProjects.reduce((sum, p) => sum + p.milestones.length, 0)
  const completedMilestones = allProjects.reduce((sum, p) =>
    sum + p.milestones.filter((m) => m.status === "APPROVED").length, 0
  )

  const avgProjectValue = allProjects.length > 0
    ? Math.round(allProjects.reduce((s, p) => s + p.totalAmount, 0) / allProjects.length)
    : 0

  const monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; total: number }>>`
    SELECT to_char("createdAt", 'YYYY-MM') as month,
           SUM("totalAmount") as total
    FROM "Project"
    WHERE status = 'COMPLETED'
      AND ("clientId" = ${user!.id} OR "freelancerId" = ${user!.id})
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
  `

  return NextResponse.json({
    overview: {
      totalProjects: allProjects.length,
      activeProjects: active.length,
      completedProjects: completed.length,
      disputedProjects: disputed.length,
      totalRevenue,
      activeRevenue,
      completionRate: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
      avgProjectValue,
    },
    monthlyRevenue,
  })
}
