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

  const invite = await prisma.organizationInvite.findUnique({
    where: { token },
    include: { organization: true },
  })

  if (!invite) return NextResponse.json({ error: "Invalid invite" }, { status: 404 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: "Invite expired" }, { status: 410 })
  if (invite.email !== user!.email) return NextResponse.json({ error: "This invite was sent to a different email" }, { status: 403 })

  const existing = await prisma.teamOrganizationMember.findFirst({
    where: { organizationId: invite.organizationId, userId: user!.id },
  })

  if (existing) {
    await prisma.organizationInvite.delete({ where: { id: invite.id } })
    return NextResponse.json({ success: true, message: "Already a member" })
  }

  await prisma.teamOrganizationMember.create({
    data: { organizationId: invite.organizationId, userId: user!.id, role: invite.role },
  })

  await prisma.organizationInvite.delete({ where: { id: invite.id } })

  return NextResponse.json({ success: true })
}
