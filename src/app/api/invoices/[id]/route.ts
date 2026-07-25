import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { stripe } from "@/lib/stripe"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { project: { select: { title: true } }, fromUser: { select: { name: true } }, toUser: { select: { name: true } } },
  })

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (invoice.fromUserId !== user!.id && invoice.toUserId !== user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(invoice)
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

  const invoice = await prisma.invoice.findUnique({ where: { id } })
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (action === "PAY") {
    if (invoice.toUserId !== user!.id) return NextResponse.json({ error: "Only recipient can pay" }, { status: 403 })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: invoice.totalAmount,
      currency: invoice.currency.toLowerCase(),
      metadata: { invoiceId: invoice.id, projectId: invoice.projectId },
    })

    await prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  }

  if (action === "SEND") {
    if (invoice.fromUserId !== user!.id) return NextResponse.json({ error: "Only sender can send" }, { status: 403 })
    await prisma.invoice.update({ where: { id }, data: { status: "SENT" } })
  }

  return NextResponse.json({ success: true })
}
