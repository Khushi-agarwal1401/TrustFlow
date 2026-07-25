import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { Prisma } from "@prisma/client"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const before = searchParams.get("before")

  const where: Prisma.MessageWhereInput = {
    projectId: id,
    project: { OR: [{ clientId: user!.id }, { freelancerId: user!.id }] },
  }
  if (before) where.createdAt = { lt: new Date(before) }

  const messages = await prisma.message.findMany({
    where,
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(messages.reverse())
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { content, type } = await request.json()

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: { projectId: id, senderId: user!.id, content, type: type || "TEXT" },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return NextResponse.json(message, { status: 201 })
}
