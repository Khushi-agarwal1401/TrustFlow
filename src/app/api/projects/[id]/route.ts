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
      milestones: { 
        orderBy: { sequence: "asc" },
        include: {
          submissions: {
            orderBy: { submittedAt: "desc" },
            take: 1,
            include: { aiReview: true }
          }
        }
      },
      contract: {
        include: {
          signatures: {
            include: { user: true }
          }
        }
      },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const { milestones, terms } = body

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const totalAmount = milestones.reduce((sum: number, m: { amount: number }) => sum + (Number(m.amount) || 0), 0)
  if (totalAmount !== project.totalAmount) {
    return NextResponse.json({ error: "Milestone total must match project budget" }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.milestone.deleteMany({ where: { projectId: id } })
    
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i]
      await tx.milestone.create({
        data: {
          projectId: id,
          sequence: i,
          title: m.title,
          deliverableDescription: m.deliverableDescription,
          amount: m.amount,
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
        }
      })
    }

    const contract = await tx.contract.findUnique({ where: { projectId: id } })
    if (contract) {
      await tx.contract.update({
        where: { id: contract.id },
        data: { finalTerms: { terms } }
      })
    } else {
      await tx.contract.create({
        data: {
          projectId: id,
          aiGeneratedDraft: { terms },
          finalTerms: { terms }
        }
      })
    }
  })

  return NextResponse.json({ success: true })
}
