import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectId, paymentIntentId } = await request.json()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.escrowTransaction.updateMany({
    where: { providerReferenceId: paymentIntentId },
    data: { status: "SUCCEEDED" },
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { status: "IN_PROGRESS" },
  })

  await prisma.projectEvent.create({
    data: {
      projectId,
      actorId: user!.id,
      eventType: "MILESTONE_FUNDED",
      metadata: { paymentIntentId },
    }
  })

  return NextResponse.json({ success: true })
}
