import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  return NextResponse.json({ message: "GitHub webhook receiver active" })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const event = request.headers.get("x-github-event") || "push"

  const integration = await prisma.webhookIntegration.findFirst({
    where: { provider: "GITHUB", events: { has: event } },
    include: { project: true },
  })

  if (!integration) return NextResponse.json({ message: "No matching integration" })

  await prisma.webhookDelivery.create({
    data: {
      integrationId: integration.id,
      event,
      payload: body as Prisma.InputJsonValue,
      status: "received",
      responseCode: 200,
    },
  })

  await prisma.projectEvent.create({
    data: {
      projectId: integration.projectId,
      eventType: `GITHUB_${event.toUpperCase()}`,
      metadata: body as Prisma.InputJsonValue,
    },
  })

  return NextResponse.json({ received: true })
}
