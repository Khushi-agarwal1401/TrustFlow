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

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: { include: { user: true }, orderBy: { createdAt: "asc" } },
      _count: { select: { projects: true } },
    },
  })

  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const membership = org.members.find((m) => m.userId === user!.id)
  if (!membership) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json({ ...org, currentMemberRole: membership.role })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { name } = await request.json()

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (org.ownerId !== user!.id) return NextResponse.json({ error: "Only owner can update" }, { status: 403 })

  const updated = await prisma.organization.update({
    where: { id },
    data: { name },
  })

  return NextResponse.json(updated)
}
