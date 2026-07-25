import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

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

  const totalAmount = project.milestones.reduce((sum, m) => sum + m.amount, 0)

  const existing = await prisma.escrowTransaction.findFirst({
    where: { milestoneId: project.milestones[0]?.id },
  })

  if (existing?.providerReferenceId) {
    return NextResponse.json({ clientSecret: null, paymentIntentId: existing.providerReferenceId })
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: "usd",
    metadata: { projectId, userId: user!.id },
    automatic_payment_methods: { enabled: true },
  })

  for (const milestone of project.milestones) {
    await prisma.escrowTransaction.create({
      data: {
        milestoneId: milestone.id,
        amount: milestone.amount,
        provider: "STRIPE",
        type: "FUND",
        status: "PENDING",
        providerReferenceId: paymentIntent.id,
        idempotencyKey: `pi_${paymentIntent.id}_${milestone.id}`,
      },
    })
  }

  return NextResponse.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id })
}
