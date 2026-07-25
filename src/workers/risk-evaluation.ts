import { Worker } from "bullmq"
import { redisConnection } from "../lib/queue"
import { prisma } from "../lib/prisma"

export const riskWorker = new Worker("risk-signal", async (job) => {
  const { projectId } = job.data

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      projectEvents: { orderBy: { createdAt: "desc" }, take: 20 },
      milestones: true,
      riskSignals: { orderBy: { computedAt: "desc" }, take: 1 },
    }
  })

  if (!project) return

  // Basic heuristics for rapid evaluations
  let riskLevel = "GREEN"
  let reason = "Project is proceeding normally."

  const revisionEvents = project.projectEvents.filter(e => e.eventType === "MILESTONE_REJECTED")
  const disputeEvents = project.projectEvents.filter(e => e.eventType === "DISPUTE_RAISED")

  if (disputeEvents.length > 0) {
    riskLevel = "RED"
    reason = "A dispute has been raised on the project."
  } else if (revisionEvents.length >= 3) {
    riskLevel = "AMBER"
    reason = "Multiple revision requests indicating potential misalignment."
  }

  // Create a new risk signal if the level changed or it's been a while, but for simplicity, 
  // we'll just log it if there's no existing signal or if the level differs from the last one.
  const lastSignal = project.riskSignals[0]
  if (!lastSignal || lastSignal.level !== riskLevel) {
    await prisma.riskSignal.create({
      data: {
        projectId,
        level: riskLevel as "GREEN" | "AMBER" | "RED",
        reason,
      }
    })
  }

}, { connection: redisConnection })
