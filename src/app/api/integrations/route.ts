import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const integrations = await prisma.webhookIntegration.findMany({
    where: { project: { clientId: user!.id } },
    include: { project: { select: { title: true } }, _count: { select: { deliveries: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(integrations)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectId, provider, name, webhookUrl, events } = await request.json()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const integration = await prisma.webhookIntegration.create({
    data: { projectId, provider, name, webhookUrl, events: events || [] },
  })

  return NextResponse.json(integration, { status: 201 })
}
