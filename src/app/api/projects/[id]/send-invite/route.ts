import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { resend } from "@/lib/resend"
import { nanoid } from "nanoid"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { id } = await params
  const { email } = await request.json()

  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 })

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (project.clientId !== user!.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const inviteToken = nanoid(32)

  await prisma.project.update({
    where: { id },
    data: { inviteToken, freelancerInviteEmail: email, status: "AWAITING_ACCEPTANCE" },
  })

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`

  await resend.emails.send({
    from: "TrustFlow <invites@trustflow.ai>",
    to: email,
    subject: `You're invited to collaborate on "${project.title}"`,
    html: `<p>You've been invited to join the project <strong>${project.title}</strong> on TrustFlow.</p>
           <p>View the contract and respond: <a href="${inviteUrl}">${inviteUrl}</a></p>`,
  })

  return NextResponse.json({ success: true, inviteUrl })
}
