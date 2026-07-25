import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { sendEmailNotification } from "@/lib/notifications"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true, escrowTransactions: true },
  })

  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (milestone.project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (milestone.status !== "SUBMITTED") return NextResponse.json({ error: "Not submitted" }, { status: 400 })

  const escrow = milestone.escrowTransactions[0]
  if (escrow?.providerReferenceId && escrow.status === "SUCCEEDED") {
    await stripe.paymentIntents.capture(escrow.providerReferenceId, {
      amount_to_capture: milestone.amount,
    })
    await prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data: { status: "SUCCEEDED" },
    })
  }

  await prisma.milestone.update({
    where: { id },
    data: { status: "APPROVED" },
  })

  await prisma.projectEvent.create({
    data: {
      projectId: milestone.projectId,
      actorId: user!.id,
      eventType: "MILESTONE_APPROVED",
      metadata: { milestoneId: id },
    }
  })

  await sendEmailNotification({
    userId: milestone.project.freelancerId!,
    projectId: milestone.projectId,
    eventType: "MILESTONE_APPROVED",
    payload: { milestoneId: id },
  })

  const allMilestones = await prisma.milestone.findMany({
    where: { projectId: milestone.projectId },
  })

  const allApproved = allMilestones.every((m) => m.status === "APPROVED")
  if (allApproved) {
    await prisma.project.update({
      where: { id: milestone.projectId },
      data: { status: "COMPLETED" },
    })
  }

  return NextResponse.json({ success: true })
}
