import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { prisma } from "@/lib/prisma"
import { splitMilestones } from "@/lib/ai-copilot"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectId, count } = await request.json()

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true },
  })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const result = await splitMilestones(project.description, project.totalAmount, count || 4)

  await prisma.milestone.deleteMany({ where: { projectId } })

  for (let i = 0; i < result.milestones.length; i++) {
    const m = result.milestones[i]
    await prisma.milestone.create({
      data: {
        projectId,
        sequence: i,
        title: m.title,
        deliverableDescription: m.description,
        amount: m.amount,
        dueDate: new Date(Date.now() + (i + 1) * 14 * 24 * 60 * 60 * 1000),
      },
    })
  }

  return NextResponse.json(result)
}
