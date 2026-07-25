import { prisma } from "./prisma"

export async function sendPushNotification(userId: string, title: string, body: string) {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  })

  for (const sub of subs) {
    try {
      const payload = JSON.stringify({ title, body })

      await fetch(sub.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "TTL": "86400",
        },
        body: payload,
      })
    } catch {
      await prisma.pushSubscription.delete({ where: { id: sub.id } })
    }
  }
}
