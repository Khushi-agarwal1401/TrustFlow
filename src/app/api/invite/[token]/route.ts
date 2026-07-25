import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const project = await prisma.project.findUnique({
    where: { inviteToken: token },
    include: {
      client: true,
      contract: true,
      milestones: { orderBy: { sequence: "asc" } },
    },
  })

  if (!project) return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 })
  if (project.status !== "AWAITING_ACCEPTANCE") {
    return NextResponse.json({ error: "Invite is no longer active" }, { status: 410 })
  }

  return NextResponse.json({
    project: {
      id: project.id,
      title: project.title,
      description: project.description,
      totalAmount: project.totalAmount,
      client: { name: project.client.name, email: project.client.email },
      milestones: project.milestones,
      aiGeneratedDraft: project.contract?.aiGeneratedDraft,
    },
  })
}
