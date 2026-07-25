import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  if (!user!.roles.includes("ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      milestone: {
        include: {
          project: {
            select: { id: true, title: true, clientId: true, freelancerId: true },
          },
        },
      },
      opener: { select: { id: true, name: true, email: true } },
      resolver: { select: { id: true, name: true, email: true } },
      evidences: {
        include: { submitter: { select: { id: true, name: true } } },
      },
    },
  })

  return NextResponse.json(disputes)
}
