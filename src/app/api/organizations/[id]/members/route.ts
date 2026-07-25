import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const members = await prisma.teamOrganizationMember.findMany({
    where: { organizationId: id },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(members)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { userId } = await request.json()

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (org.ownerId !== user!.id) return NextResponse.json({ error: "Only owner can remove members" }, { status: 403 })
  if (userId === org.ownerId) return NextResponse.json({ error: "Cannot remove owner" }, { status: 400 })

  await prisma.teamOrganizationMember.deleteMany({
    where: { organizationId: id, userId },
  })

  return NextResponse.json({ success: true })
}
