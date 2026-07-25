import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { token } = await params
  const { action } = await request.json()

  const project = await prisma.project.findUnique({ where: { inviteToken: token } })
  if (!project) return NextResponse.json({ error: "Invalid invite" }, { status: 404 })

  if (action === "ACCEPT") {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        freelancerId: user!.id,
        status: "AWAITING_FUNDING",
        inviteToken: null,
      },
    })
    return NextResponse.json({ success: true, status: "AWAITING_FUNDING" })
  }

  if (action === "DECLINE") {
    await prisma.project.update({
      where: { id: project.id },
      data: { status: "DRAFT", inviteToken: null },
    })
    return NextResponse.json({ success: true, status: "DRAFT" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
