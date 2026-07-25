import { NextResponse } from "next/server"
import { auth } from "./auth"
import { prisma } from "./prisma"

export async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return await prisma.user.findUnique({ where: { id: session.user.id } })
}

export function requireAuth(user: Awaited<ReturnType<typeof getAuthUser>>) {
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return null
}
