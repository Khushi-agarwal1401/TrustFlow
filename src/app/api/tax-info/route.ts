import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const taxInfo = await prisma.taxInfo.findMany({
    where: { userId: user!.id },
  })

  return NextResponse.json(taxInfo)
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { taxId, taxType, country, address } = await request.json()

  const existing = await prisma.taxInfo.findUnique({
    where: { userId_taxType: { userId: user!.id, taxType } },
  })
  if (existing) return NextResponse.json({ error: "Tax info for this type already exists" }, { status: 400 })

  const taxInfo = await prisma.taxInfo.create({
    data: { userId: user!.id, taxId, taxType, country, address },
  })

  return NextResponse.json(taxInfo, { status: 201 })
}
