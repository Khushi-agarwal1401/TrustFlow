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

  const review = await prisma.aIReview.findUnique({
    where: { submissionId: id },
    include: {
      submission: {
        include: {
          milestone: {
            include: { project: { select: { clientId: true, freelancerId: true } } },
          },
        },
      },
    },
  })

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 })
  }

  const project = review.submission.milestone.project
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({
    matchSummary: review.matchSummary,
    confidence: review.confidence,
    createdAt: review.createdAt,
  })
}
