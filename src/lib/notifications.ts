import { prisma } from "./prisma"
import { resend } from "./resend"

interface SendNotificationParams {
  userId: string
  projectId: string
  eventType: string
  payload: Record<string, unknown>
}

export async function createNotification(params: SendNotificationParams) {
  const event = await prisma.projectEvent.create({
    data: {
      projectId: params.projectId,
      actorId: params.userId,
      eventType: params.eventType,
      metadata: params.payload as any,
    },
  })

  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.eventType,
      payload: params.payload as any,
    },
  })

  return event
}

export async function sendEmailNotification(params: SendNotificationParams) {
  const user = await prisma.user.findUnique({ where: { id: params.userId } })
  if (!user?.email) return

  await resend.emails.send({
    from: "TrustFlow <notifications@trustflow.ai>",
    to: user.email,
    subject: params.eventType,
    html: `<p>${JSON.stringify(params.payload)}</p>`,
  })
}

export async function notifyUser(params: SendNotificationParams) {
  await createNotification(params)
  await sendEmailNotification(params)
}
