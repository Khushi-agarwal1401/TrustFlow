import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const templates = await prisma.clauseTemplate.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(templates)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error
  if (!user!.roles.includes("ADMIN")) return NextResponse.json({ error: "Admin only" }, { status: 403 })

  const { name, description, jurisdiction, category, content } = await request.json()

  const template = await prisma.clauseTemplate.create({
    data: { name, description, jurisdiction, category, content },
  })

  return NextResponse.json(template, { status: 201 })
}
