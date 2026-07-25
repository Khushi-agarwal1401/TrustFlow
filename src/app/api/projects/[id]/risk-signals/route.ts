import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const latest = await prisma.riskSignal.findFirst({
    where: { projectId: id },
    orderBy: { computedAt: "desc" },
  })

  const recent = await prisma.riskSignal.findMany({
    where: { projectId: id },
    orderBy: { computedAt: "desc" },
    take: 10,
  })

  return NextResponse.json({ latest, history: recent })
}
