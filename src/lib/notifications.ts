import { prisma } from "./prisma"
import { resend } from "./resend"

type EventType =
  | "MILESTONE_SUBMITTED"
  | "MILESTONE_APPROVED"
  | "MILESTONE_REJECTED"
  | "DISPUTE_OPENED"
  | "DISPUTE_RESOLVED"
  | "INVITE_ACCEPTED"
  | "FUNDS_DEPOSITED"
  | "PROJECT_COMPLETED"
  | "RISK_DETECTED"
  | "FREELANCER_REPLACED"

interface SendNotificationParams {
  userId: string
  projectId: string
  type: EventType
  title: string
  message: string
}

export async function createNotification(params: SendNotificationParams) {
  const event = await prisma.projectEvent.create({
    data: {
      projectId: params.projectId,
      actorId: params.userId,
      type: params.type,
      metadata: { title: params.title, message: params.message },
    },
  })

  await prisma.notification.create({
    data: {
      userId: params.userId,
      projectEventId: event.id,
      title: params.title,
      message: params.message,
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
    subject: params.title,
    html: `<p>${params.message}</p>`,
  })
}

export async function notifyUser(params: SendNotificationParams) {
  await createNotification(params)
  await sendEmailNotification(params)
}
