import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge })
  }

  const event = body.event?.type || "unknown"

  const integration = await prisma.webhookIntegration.findFirst({
    where: { provider: "SLACK" },
    include: { project: true },
  })

  if (!integration) return NextResponse.json({ message: "No matching integration" })

  await prisma.webhookDelivery.create({
    data: {
      integrationId: integration.id,
      event,
      payload: body as Prisma.InputJsonValue,
      status: "received",
    },
  })

  return NextResponse.json({ received: true })
}
