import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const invoices = await prisma.invoice.findMany({
    where: { OR: [{ fromUserId: user!.id }, { toUserId: user!.id }] },
    include: {
      project: { select: { title: true } },
      fromUser: { select: { name: true } },
      toUser: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(invoices)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectId, toUserId, lineItems, taxPercent, dueDate } = await request.json()

  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const subtotal = lineItems.reduce((sum: number, item: { amount: number }) => sum + Math.round(item.amount * 100), 0)
  const taxAmount = Math.round(subtotal * (taxPercent || 0) / 100)

  const invoice = await prisma.invoice.create({
    data: {
      projectId,
      fromUserId: user!.id,
      toUserId,
      lineItems: lineItems as any,
      subtotal,
      taxPercent: taxPercent || 0,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  })

  return NextResponse.json(invoice, { status: 201 })
}
