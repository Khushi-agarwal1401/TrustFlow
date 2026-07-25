import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { statement, fileUrls } = body

  const dispute = await prisma.dispute.findUnique({
    where: { id },
    include: { milestone: { include: { project: true } } },
  })

  if (!dispute) {
    return NextResponse.json({ error: "Dispute not found" }, { status: 404 })
  }

  const project = dispute.milestone.project
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const evidence = await prisma.disputeEvidence.create({
    data: {
      disputeId: id,
      submittedBy: user!.id,
      statement: statement ?? "",
      fileUrls: fileUrls ?? [],
    },
  })

  return NextResponse.json(evidence, { status: 201 })
}
