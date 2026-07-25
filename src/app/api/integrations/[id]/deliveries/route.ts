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

  const deliveries = await prisma.webhookDelivery.findMany({
    where: { integrationId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(deliveries)
}
