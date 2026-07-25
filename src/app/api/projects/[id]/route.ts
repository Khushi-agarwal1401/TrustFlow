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

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { orderBy: { sequence: "asc" } },
      contract: true,
      freelancer: true,
      client: true,
      riskSignals: { orderBy: { computedAt: "desc" }, take: 5 },
    },
  })

  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id && project.freelancerId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(project)
}
