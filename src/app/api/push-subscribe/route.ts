import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { endpoint, keys } = await request.json()

  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } })
  if (existing) return NextResponse.json(existing)

  const sub = await prisma.pushSubscription.create({
    data: {
      userId: user!.id,
      endpoint,
      p256dhKey: keys.p256dh,
      authKey: keys.auth,
    },
  })

  return NextResponse.json(sub, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { endpoint } = await request.json()

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user!.id } })

  return NextResponse.json({ success: true })
}
