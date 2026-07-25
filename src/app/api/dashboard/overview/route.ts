import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"

export async function GET() {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const userId = user!.id

  // ── All projects for this user ──
  const allProjects = await prisma.project.findMany({
    where: { OR: [{ clientId: userId }, { freelancerId: userId }] },
    include: {
      milestones: { orderBy: { sequence: "asc" } },
      client: { select: { id: true, name: true } },
      freelancer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  // ── Escrow Data ──
  const escrowTransactions = await prisma.escrowTransaction.findMany({
    where: {
      milestone: {
        project: { OR: [{ clientId: userId }, { freelancerId: userId }] },
      },
      status: { in: ["PENDING", "SUCCEEDED"] },
    },
  })

  const escrowProtected = escrowTransactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalFunded = escrowTransactions
    .filter((t) => t.status === "SUCCEEDED")
    .reduce((sum, t) => sum + t.amount, 0)

  const activeEscrowCount = allProjects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING"
  ).length

  // ── Ratings & Scores ──
  const ratings = await prisma.rating.findMany({
    where: { ratedUser: userId },
    select: { score: true },
  })

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
    : null

  // ── Milestone Stats ──
  const totalMilestones = allProjects.reduce((s, p) => s + p.milestones.length, 0)
  const completedMilestones = allProjects.reduce(
    (s, p) => s + p.milestones.filter((m) => m.status === "APPROVED" || m.status === "PAID").length,
    0
  )
  const pendingMilestones = allProjects.reduce(
    (s, p) => s + p.milestones.filter((m) => m.status === "PENDING").length,
    0
  )
  const submittedMilestones = allProjects.reduce(
    (s, p) => s + p.milestones.filter((m) => m.status === "SUBMITTED" || m.status === "IN_REVIEW").length,
    0
  )
  const disputedMilestones = allProjects.reduce(
    (s, p) => s + p.milestones.filter((m) => m.status === "DISPUTED").length,
    0
  )

  // ── Dispute Rate ──
  const totalDisputes = await prisma.dispute.count({
    where: { milestone: { project: { OR: [{ clientId: userId }, { freelancerId: userId }] } } },
  })
  const disputeRate = allProjects.length > 0 ? (totalDisputes / allProjects.length) * 100 : 0

  // ── AI Trust Score Computation ──
  const completionRate = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 100
  const ratingScore = avgRating ? (avgRating / 5) * 100 : 100
  const disputePenalty = Math.min(disputeRate * 10, 50)
  const milestoneCompletionWeight = completionRate * 0.4
  const ratingWeight = ratingScore * 0.4
  const timelinessWeight = 100 - disputePenalty
  const aiTrustScore = Math.round(milestoneCompletionWeight * 0.5 + ratingWeight * 0.3 + timelinessWeight * 0.2)

  // ── Current Phase ──
  const activeProject = allProjects.find(
    (p) => p.status === "IN_PROGRESS" || p.status === "AWAITING_FUNDING" || p.status === "DRAFT"
  )

  let currentPhase = null
  if (activeProject) {
    const nextMilestone = activeProject.milestones.find(
      (m) => m.status === "PENDING" || m.status === "SUBMITTED"
    )
    currentPhase = {
      projectId: activeProject.id,
      projectTitle: activeProject.title,
      status: activeProject.status,
      phase: activeProject.status === "DRAFT" ? "draft" : activeProject.status === "AWAITING_FUNDING" ? "funding" : "in_progress",
      nextMilestone: nextMilestone ? {
        id: nextMilestone.id,
        title: nextMilestone.title,
        status: nextMilestone.status,
        sequence: nextMilestone.sequence,
        amount: nextMilestone.amount,
      } : null,
      role: activeProject.clientId === userId ? "client" : "freelancer",
      counterpartyName: activeProject.clientId === userId
        ? activeProject.freelancer?.name
        : activeProject.client?.name,
    }
  }

  // ── Escrow Trend (compare to last month) ──
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const previousEscrow = escrowTransactions
    .filter((t) => new Date(t.createdAt) < lastMonth)
    .reduce((sum, t) => sum + t.amount, 0)

  const escrowChangePercent = previousEscrow > 0
    ? Math.round(((escrowProtected + totalFunded - previousEscrow) / previousEscrow) * 100)
    : 100

  return NextResponse.json({
    escrow: {
      protectedAmount: escrowProtected,
      totalFunded,
      activeEscrowCount,
      changePercent: escrowChangePercent,
    },
    aiTrustScore: {
      score: aiTrustScore,
      rating: avgRating,
      completionRate: Math.round(completionRate),
      disputeRate: Math.round(disputeRate),
    },
    currentPhase,
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      pending: pendingMilestones,
      submitted: submittedMilestones,
      disputed: disputedMilestones,
      completionPercent: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0,
    },
    projects: {
      total: allProjects.length,
      active: activeEscrowCount,
      completed: allProjects.filter((p) => p.status === "COMPLETED").length,
      disputed: allProjects.filter((p) => p.status === "DISPUTED").length,
    },
  })
}
