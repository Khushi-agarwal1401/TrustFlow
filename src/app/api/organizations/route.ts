import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { nanoid } from "nanoid"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const orgs = await prisma.organization.findMany({
    where: { members: { some: { userId: user!.id } } },
    include: { members: { include: { user: true } }, _count: { select: { members: true, projects: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orgs)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + nanoid(6)

  const org = await prisma.organization.create({
    data: { name, slug, ownerId: user!.id },
  })

  await prisma.teamOrganizationMember.create({
    data: { organizationId: org.id, userId: user!.id, role: "OWNER" },
  })

  return NextResponse.json(org, { status: 201 })
}
