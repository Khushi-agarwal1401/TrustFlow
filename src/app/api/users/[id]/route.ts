import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const profileUser = await prisma.user.findUnique({
    where: { id },
    include: {
      freelancerProfile: true,
      ratingsReceived: { include: { rater: { select: { name: true } } } },
      _count: { select: { projectsAsFreelancer: true } },
    },
  })

  if (!profileUser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const avgRating = profileUser.ratingsReceived.length > 0
    ? profileUser.ratingsReceived.reduce((s, r) => s + r.score, 0) / profileUser.ratingsReceived.length
    : null

  return NextResponse.json({
    id: profileUser.id,
    name: profileUser.name,
    email: profileUser.email,
    avatarUrl: profileUser.avatarUrl,
    roles: profileUser.roles,
    profile: profileUser.freelancerProfile,
    stats: { completedProjects: profileUser._count.projectsAsFreelancer, avgRating, totalReviews: profileUser.ratingsReceived.length },
    recentReviews: profileUser.ratingsReceived.slice(0, 5),
  })
}
