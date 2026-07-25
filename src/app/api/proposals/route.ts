import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")

  const where: Record<string, unknown> = { freelancerId: user!.id }
  if (projectId) where.projectId = projectId

  const proposals = await prisma.proposal.findMany({
    where: where as any,
    include: { project: { select: { id: true, title: true, totalAmount: true, status: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(proposals)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error
  if (!user!.roles.includes("FREELANCER")) return NextResponse.json({ error: "Only freelancers can submit proposals" }, { status: 403 })

  const { projectId, coverLetter, bidAmount } = await request.json()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
  if (!project.isListed) return NextResponse.json({ error: "Project not accepting proposals" }, { status: 400 })
  if (project.clientId === user!.id) return NextResponse.json({ error: "Cannot bid on your own project" }, { status: 400 })

  const existing = await prisma.proposal.findFirst({
    where: { projectId, freelancerId: user!.id, status: { not: "WITHDRAWN" } },
  })
  if (existing) return NextResponse.json({ error: "Already submitted a proposal" }, { status: 400 })

  const proposal = await prisma.proposal.create({
    data: { projectId, freelancerId: user!.id, coverLetter, bidAmount: Math.round(bidAmount * 100) },
  })

  return NextResponse.json(proposal, { status: 201 })
}
