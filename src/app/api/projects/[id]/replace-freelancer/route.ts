import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { nanoid } from "nanoid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { newFreelancerEmail } = body

  if (!newFreelancerEmail) {
    return NextResponse.json({ error: "Missing newFreelancerEmail" }, { status: 400 })
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { milestones: true },
  })

  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Only the client can replace freelancers" }, { status: 403 })
  if (!project.freelancerId && project.status !== "AWAITING_ACCEPTANCE") {
    return NextResponse.json({ error: "No freelancer assigned to replace" }, { status: 400 })
  }

  const inviteToken = nanoid(32)

  await prisma.project.update({
    where: { id },
    data: {
      freelancerId: null,
      inviteToken,
      freelancerInviteEmail: newFreelancerEmail,
      status: "AWAITING_ACCEPTANCE",
    },
  })

  await prisma.milestone.updateMany({
    where: { projectId: id },
    data: { status: "PENDING" },
  })

  return NextResponse.json({
    success: true,
    inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`,
  })
}
