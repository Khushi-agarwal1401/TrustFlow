import { prisma } from "./prisma"

interface RiskResult {
  level: "GREEN" | "AMBER" | "RED"
  signals: string[]
}

export async function computeRiskSignals(projectId: string): Promise<RiskResult> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { milestones: true, disputes: true },
  })

  if (!project) return { level: "GREEN", signals: [] }

  const signals: string[] = []

  const now = new Date()
  const overdueMilestones = project.milestones.filter(
    (m) => m.dueDate && m.dueDate < now && m.status === "PENDING"
  )
  if (overdueMilestones.length > 0) {
    signals.push(`${overdueMilestones.length} overdue milestone(s)`)
  }

  const recentActivity = await prisma.projectEvent.findFirst({
    where: { projectId, createdAt: { gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) } },
  })
  if (!recentActivity) {
    signals.push("No activity in 14+ days")
  }

  const revisionCount = await prisma.milestone.count({
    where: { projectId, revisionCount: { gte: 2 } },
  })
  if (revisionCount > 0) {
    signals.push(`${revisionCount} milestone(s) with 2+ revisions`)
  }

  if (project.disputes.length > 0) {
    signals.push(`${project.disputes.length} active dispute(s)`)
  }

  let level: RiskResult["level"] = "GREEN"
  if (signals.length >= 3) level = "RED"
  else if (signals.length >= 1) level = "AMBER"

  await prisma.riskSignal.create({
    data: {
      projectId,
      level,
      signals,
      computedAt: now,
    },
  })

  return { level, signals }
}
