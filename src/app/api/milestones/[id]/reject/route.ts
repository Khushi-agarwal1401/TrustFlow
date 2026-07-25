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
  const { reason } = await request.json()

  if (!reason) return NextResponse.json({ error: "Reason is required" }, { status: 400 })

  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: { project: true },
  })

  if (!milestone) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (milestone.project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  if (milestone.revisionCount >= 2) {
    return NextResponse.json({ error: "Maximum revisions reached; escalate to dispute" }, { status: 400 })
  }

  await prisma.milestone.update({
    where: { id },
    data: {
      status: "PENDING",
      revisionCount: { increment: 1 },
    },
  })

  return NextResponse.json({ success: true, reason })
}
