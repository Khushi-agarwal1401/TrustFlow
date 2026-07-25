import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const profile = await prisma.freelancerProfile.findUnique({
    where: { userId: user!.id },
  })

  return NextResponse.json(profile)
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { title, bio, skills, hourlyRate, portfolio, availability } = await request.json()

  const profile = await prisma.freelancerProfile.upsert({
    where: { userId: user!.id },
    update: { title, bio, skills, hourlyRate: hourlyRate ? Math.round(hourlyRate * 100) : undefined, portfolio, availability },
    create: { userId: user!.id, title, bio, skills: skills || [], hourlyRate: hourlyRate ? Math.round(hourlyRate * 100) : undefined, portfolio, availability },
  })

  return NextResponse.json(profile)
}
