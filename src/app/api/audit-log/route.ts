import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const logs = await prisma.auditLog.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(logs)
}
