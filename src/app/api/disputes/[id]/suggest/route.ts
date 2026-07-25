import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { suggestDisputeResolution } from "@/lib/ai-dispute"

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: {
      evidences: {
        include: { submitter: { select: { id: true } } },
      },
      milestone: {
        include: {
          project: { include: { contract: true } },
        },
      },
    },
  })

  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
  }

  const project = dispute.milestone.project
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const openerEvidence = dispute.evidences.find((e) => e.submittedBy === dispute.openedBy)
  const respondentEvidence = dispute.evidences.find((e) => e.submittedBy !== dispute.openedBy)

  const contractTerms = project.contract?.finalTerms
    ? JSON.stringify(project.contract.finalTerms)
    : "No contract terms available"

  const resolution = await suggestDisputeResolution(
    contractTerms,
    dispute.milestone.title,
    dispute.milestone.deliverableDescription,
    openerEvidence?.statement ?? "",
    openerEvidence?.fileUrls ?? [],
    respondentEvidence?.statement ?? "",
    respondentEvidence?.fileUrls ?? []
  )

  if (!resolution) {
    return NextResponse.json({ error: "AI suggestion unavailable" }, { status: 503 })
  }

  await prisma.dispute.update({
    where: { id },
    data: {
      aiSuggestedResolution: resolution as any,
      status: "AI_SUGGESTED",
    },
  })

  return NextResponse.json({ resolution })
}
