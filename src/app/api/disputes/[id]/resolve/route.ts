import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { createNotification } from "@/lib/notifications"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { accept, adminNote } = body

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      milestone: { include: { project: true } },
    },
  })

  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
  }

  if (dispute.status !== "AI_SUGGESTED" && dispute.status !== "EVIDENCE_PENDING") {
    return NextResponse.json({ error: "Dispute cannot be resolved in current status" }, { status: 400 })
  }

  const project = dispute.milestone.project
  const isAdmin = user!.roles.includes("ADMIN")
  const isParty = project.clientId === user!.id || project.freelancerId === user!.id

  if (!isAdmin && !isParty) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const resolvedBy = accept && dispute.aiSuggestedResolution ? "RESOLVED_ACCEPTED" : "ESCALATED"
  const resolvedById = isAdmin ? user!.id : null

  if (resolvedBy === "RESOLVED_ACCEPTED") {
    await prisma.dispute.update({
      where: { id },
      data: {
        status: "RESOLVED_ACCEPTED",
        resolvedBy: resolvedById,
        resolutionNotes: adminNote ?? "Accepted AI suggested resolution",
        resolvedAt: new Date(),
      },
    })

    await prisma.milestone.update({
      where: { id: dispute.milestoneId },
      data: { status: "APPROVED" },
    })

    await prisma.project.update({
      where: { id: project.id },
      data: { status: "IN_PROGRESS" },
    })
  } else {
    await prisma.dispute.update({
      where: { id },
      data: {
        status: "ESCALATED",
        resolvedBy: resolvedById,
        resolutionNotes: adminNote ?? "Escalated to admin",
        resolvedAt: new Date(),
      },
    })
  }

  await createNotification({
    userId: user!.id,
    projectId: project.id,
    eventType: "DISPUTE_RESOLVED",
    payload: { disputeId: id, resolution: resolvedBy },
  })

  return NextResponse.json({ dispute })
}
