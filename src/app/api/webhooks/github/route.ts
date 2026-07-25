import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function GET() {
  return NextResponse.json({ message: "GitHub webhook receiver active" })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const event = request.headers.get("x-github-event") || "push"
  const signature = request.headers.get("x-hub-signature-256")

  const integration = await prisma.webhookIntegration.findFirst({
    where: { provider: "GITHUB", events: { has: event } },
    include: { project: true },
  })

  if (!integration) return NextResponse.json({ message: "No matching integration" })

  await prisma.webhookDelivery.create({
    data: {
      integrationId: integration.id,
      event,
      payload: body as any,
      status: "received",
      responseCode: 200,
    },
  })

  await prisma.projectEvent.create({
    data: {
      projectId: integration.projectId,
      eventType: `GITHUB_${event.toUpperCase()}`,
      metadata: body as any,
    },
  })

  return NextResponse.json({ received: true })
}
