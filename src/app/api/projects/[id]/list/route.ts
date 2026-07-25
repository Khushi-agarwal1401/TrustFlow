import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { isListed } = await request.json()

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  if (project.status !== "AWAITING_FUNDING") return NextResponse.json({ error: "Project must be funded to list publicly" }, { status: 400 })

  const updated = await prisma.project.update({
    where: { id },
    data: { isListed, listedAt: isListed ? new Date() : null },
  })

  return NextResponse.json(updated)
}
