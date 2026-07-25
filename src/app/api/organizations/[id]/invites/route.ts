import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { resend } from "@/lib/resend"
import { nanoid } from "nanoid"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params

  const invites = await prisma.organizationInvite.findMany({
    where: { organizationId: id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(invites)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { email, role } = await request.json()

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

  const org = await prisma.organization.findUnique({ where: { id } })
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (org.ownerId !== user!.id) return NextResponse.json({ error: "Only owner can invite" }, { status: 403 })

  const existingMember = await prisma.teamOrganizationMember.findFirst({
    where: { organizationId: id, user: { email } },
  })
  if (existingMember) return NextResponse.json({ error: "User is already a member" }, { status: 400 })

  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.organizationInvite.create({
    data: { organizationId: id, email, token, role: role || "MEMBER", expiresAt },
  })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/organization/${token}`

  await resend.emails.send({
    from: "TrustFlow <invites@trustflow.ai>",
    to: email,
    subject: `You're invited to join ${org.name} on TrustFlow`,
    html: `<p>You've been invited to join <strong>${org.name}</strong>.</p>
           <p>Accept: <a href="${inviteUrl}">${inviteUrl}</a></p>`,
  })

  return NextResponse.json(invite, { status: 201 })
}
