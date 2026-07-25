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

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: {
      freelancer: { select: { id: true, name: true, avatarUrl: true, freelancerProfile: true } },
      project: { select: { id: true, title: true, clientId: true } },
    },
  })

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isClient = proposal.project.clientId === user!.id
  const isFreelancer = proposal.freelancer.id === user!.id
  if (!isClient && !isFreelancer) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  return NextResponse.json(proposal)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { action } = await request.json()

  const proposal = await prisma.proposal.findUnique({
    where: { id },
    include: { project: true },
  })

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (action === "ACCEPT" || action === "REJECT") {
    if (proposal.project.clientId !== user!.id) return NextResponse.json({ error: "Only client can accept/reject" }, { status: 403 })

    if (action === "ACCEPT") {
      await prisma.$transaction([
        prisma.proposal.updateMany({ where: { projectId: proposal.projectId, status: "PENDING" }, data: { status: "REJECTED" } }),
        prisma.proposal.update({ where: { id }, data: { status: "ACCEPTED" } }),
        prisma.project.update({ where: { id: proposal.projectId }, data: { freelancerId: proposal.freelancerId, status: "AWAITING_FUNDING", isListed: false } }),
      ])
    } else {
      await prisma.proposal.update({ where: { id }, data: { status: "REJECTED" } })
    }
  }

  if (action === "WITHDRAW") {
    if (proposal.freelancerId !== user!.id) return NextResponse.json({ error: "Only freelancer can withdraw" }, { status: 403 })
    await prisma.proposal.update({ where: { id }, data: { status: "WITHDRAWN" } })
  }

  return NextResponse.json({ success: true })
}
