import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { generateContractFromDescription } from "@/lib/ai-contract"

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
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let result
  try {
    result = await generateContractFromDescription(project.description, project.totalAmount / 100)
  } catch {
    const defaultMilestones = [
      { title: "Planning & Research", description: "Initial research and project planning", amount: Math.round(project.totalAmount * 0.2) },
      { title: "Design & Prototype", description: "Design phase with wireframes and mockups", amount: Math.round(project.totalAmount * 0.3) },
      { title: "Development", description: "Core development work", amount: Math.round(project.totalAmount * 0.3) },
      { title: "Testing & Delivery", description: "Final testing and project delivery", amount: Math.round(project.totalAmount * 0.2) },
    ]

    await prisma.contract.deleteMany({ where: { projectId } })
    await prisma.milestone.deleteMany({ where: { projectId } })

    const contract = await prisma.contract.create({
      data: {
        projectId,
        aiGeneratedDraft: { terms: "Standard freelance terms: Work will be delivered in milestones. Payment is released upon approval." },
      },
    })

    for (let i = 0; i < defaultMilestones.length; i++) {
      const m = defaultMilestones[i]
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

    return NextResponse.json({
      contract,
      milestones: defaultMilestones,
      terms: "Standard freelance terms",
    })
  }

  await prisma.contract.deleteMany({ where: { projectId } })
  await prisma.milestone.deleteMany({ where: { projectId } })

  const contract = await prisma.contract.create({
    data: { projectId, aiGeneratedDraft: { terms: result.terms } },
  })

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

  return NextResponse.json({ contract, milestones: result.milestones, terms: result.terms })
}
