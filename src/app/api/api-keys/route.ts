import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { hashApiKey } from "@/lib/api-key-middleware"
import { nanoid } from "nanoid"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const keys = await prisma.apiKey.findMany({
    where: { userId: user!.id },
    select: { id: true, name: true, scopes: true, lastUsedAt: true, expiresAt: true, createdAt: true, keyHash: false },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(keys)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { name, scopes } = await request.json()

  const rawKey = `tf_${nanoid(48)}`
  const keyHash = await hashApiKey(rawKey)

  const apiKey = await prisma.apiKey.create({
    data: {
      name: name || "Untitled",
      keyHash,
      userId: user!.id,
      scopes: scopes || ["read:projects"],
    },
  })

  return NextResponse.json({ ...apiKey, rawKey }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await request.json()

  await prisma.apiKey.deleteMany({ where: { id, userId: user!.id } })

  return NextResponse.json({ success: true })
}
