import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const notifications = await prisma.notification.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(notifications)
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await request.json()

  await prisma.notification.updateMany({
    where: { id, userId: user!.id },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
