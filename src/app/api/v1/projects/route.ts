import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authenticateApiKey } from "@/lib/api-key-middleware"

export async function GET(request: NextRequest) {
  const { error, user } = await authenticateApiKey(request)
  if (error || !user) return error

  const projects = await prisma.project.findMany({
    where: { clientId: user.id },
    select: { id: true, title: true, totalAmount: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const { error, user } = await authenticateApiKey(request)
  if (error || !user) return error

  const { title, description, totalAmount } = await request.json()

  const project = await prisma.project.create({
    data: {
      title,
      description,
      totalAmount: Math.round(totalAmount * 100),
      freelancerInviteEmail: "",
      status: "DRAFT",
      clientId: user.id,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
