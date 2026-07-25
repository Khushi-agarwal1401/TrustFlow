import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { createNotification } from "@/lib/notifications"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const disputes = await prisma.dispute.findMany({
    where: {
      OR: [
        { milestone: { project: { clientId: user!.id } } },
        { milestone: { project: { freelancerId: user!.id } } },
      ],
    },
    include: {
      milestone: {
        include: { project: { select: { title: true, clientId: true, freelancerId: true } } },
      },
      evidences: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(disputes)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const body = await request.json()
  const { milestoneId, statement } = body

  if (!milestoneId || !statement) {
    return NextResponse.json({ error: "Missing milestoneId or statement" }, { status: 400 })
  }

  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  })

  if (!milestone) {
    return NextResponse.json({ error: "Milestone not found" }, { status: 404 })
  }

  if (milestone.project.clientId !== user!.id && milestone.project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const dispute = await prisma.dispute.create({
    data: {
      milestoneId,
      openedBy: user!.id,
      status: "EVIDENCE_PENDING",
    },
  })

  await prisma.disputeEvidence.create({
    data: {
      disputeId: dispute.id,
      submittedBy: user!.id,
      statement,
      fileUrls: [],
    },
  })

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "DISPUTED" },
  })

  await prisma.project.update({
    where: { id: milestone.projectId },
    data: { status: "DISPUTED" },
  })

  await createNotification({
    userId: user!.id,
    projectId: milestone.projectId,
    eventType: "DISPUTE_OPENED",
    payload: { milestoneTitle: milestone.title, projectTitle: milestone.project.title },
  })

  return NextResponse.json(dispute, { status: 201 })
}
