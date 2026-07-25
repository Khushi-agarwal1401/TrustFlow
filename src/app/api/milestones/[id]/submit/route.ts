import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { aiValidationQueue } from "@/lib/queue"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { fileUrls, linkEvidence } = body

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  })

  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (milestone.project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const submission = await prisma.submission.create({
    data: {
      milestoneId: id,
      description: "",
      fileUrls: fileUrls || [],
      linkEvidence: linkEvidence || [],
    },
  })

  await prisma.milestone.update({
    where: { id },
    data: { status: "SUBMITTED" },
  })

  await prisma.projectEvent.create({
    data: {
      projectId: milestone.projectId,
      actorId: user!.id,
      eventType: "MILESTONE_SUBMITTED",
      metadata: { milestoneId: id, submissionId: submission.id },
    }
  })

  await aiValidationQueue.add("validate", {
    submissionId: submission.id,
    milestoneId: id,
    projectId: milestone.projectId,
  })

  return NextResponse.json(submission, { status: 201 })
}
