import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const profile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const completedProjects = await prisma.project.count({
    where: {
      OR: [{ clientId: id }, { freelancerId: id }],
      status: "COMPLETED",
    },
  })

  const totalProjects = await prisma.project.count({
    where: {
      OR: [{ clientId: id }, { freelancerId: id }],
    },
  })

  const disputesAsParty = await prisma.dispute.count({
    where: {
      milestone: {
        project: {
          OR: [{ clientId: id }, { freelancerId: id }],
        },
      },
    },
  })

  const ratings = await prisma.rating.findMany({
    where: { ratedUser: id },
    select: { score: true },
  })

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : null

  const milestones = await prisma.milestone.findMany({
    where: {
      project: {
        OR: [{ clientId: id }, { freelancerId: id }],
      },
    },
    select: { status: true, dueDate: true, revisionCount: true },
  })

  const onTimeCount = milestones.filter(
    (m) => m.status === "APPROVED" || m.status === "PAID"
  ).length

  const overdueCount = milestones.filter(
    (m) => m.dueDate && m.dueDate < new Date() && m.status !== "APPROVED" && m.status !== "PAID"
  ).length

  const disputeRate =
    totalProjects > 0
      ? Math.round((disputesAsParty / totalProjects) * 100)
      : 0

  return NextResponse.json({
    profile,
    stats: {
      completedProjects,
      totalProjects,
      averageRating,
      totalRatings: ratings.length,
      onTimeDelivery: onTimeCount,
      overdueCount,
      disputeRate,
      disputesAsParty,
    },
  })
}
