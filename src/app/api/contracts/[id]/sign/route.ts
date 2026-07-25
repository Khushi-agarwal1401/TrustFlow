import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { signatureData } = await request.json()

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { project: true },
  })
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 })

  const project = contract.project
  const isParty = project.clientId === user!.id || project.freelancerId === user!.id
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const existing = await prisma.contractSignature.findUnique({
    where: { contractId_userId: { contractId: id, userId: user!.id } },
  })
  if (existing) return NextResponse.json({ error: "Already signed" }, { status: 400 })

  const signature = await prisma.contractSignature.create({
    data: {
      contractId: id,
      userId: user!.id,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      signatureData,
    },
  })

  const allSignatures = await prisma.contractSignature.findMany({
    where: { contractId: id },
  })

  const clientSigned = allSignatures.some((s) => s.userId === project.clientId)
  const freelancerSigned = project.freelancerId
    ? allSignatures.some((s) => s.userId === project.freelancerId)
    : false

  if (clientSigned && freelancerSigned) {
    await prisma.contract.update({
      where: { id },
      data: { acceptedByFreelancerAt: new Date() },
    })
  }

  return NextResponse.json(signature, { status: 201 })
}
