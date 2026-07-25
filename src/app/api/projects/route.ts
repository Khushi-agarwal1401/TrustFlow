import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { title, description, totalAmount } = await request.json()

  const project = await prisma.project.create({
    data: {
      title,
      description,
      totalAmount: Math.round(totalAmount * 100),
      freelancerInviteEmail: "",
      status: "DRAFT",
      clientId: user!.id,
    },
  })

  return NextResponse.json(project, { status: 201 })
}

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ clientId: user!.id }, { freelancerId: user!.id }],
    },
    include: { freelancer: true, client: true, milestones: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}
