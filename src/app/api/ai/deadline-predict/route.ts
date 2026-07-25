import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { prisma } from "@/lib/prisma"
import { predictDeadline } from "@/lib/ai-copilot"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectId } = await request.json()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const result = await predictDeadline(
    project.description,
    project.milestones.length,
    project.totalAmount
  )

  return NextResponse.json(result)
}
