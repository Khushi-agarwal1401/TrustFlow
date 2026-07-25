import { prisma } from "@/lib/prisma"
import { validateSubmission } from "@/lib/ai-validator"
import { aiValidationQueue, redisConnection } from "@/lib/queue"
import { Worker } from "bullmq"

async function processValidation(job: { data: { submissionId: string } }) {
  const { submissionId } = job.data

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      milestone: {
        include: { project: true },
      },
    },
  })

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`)
  }

  const linkEvidence = submission.linkEvidence as Array<{
    type: string
    url: string
    label: string
  }> | null

  const result = await validateSubmission(
    submission.milestone.deliverableDescription,
    submission.description,
    submission.fileUrls,
    linkEvidence
  )

  await prisma.aIReview.create({
    data: {
      submissionId: submission.id,
      matchSummary: result.matchSummary,
      confidence: result.confidence,
      rawModelOutput: result.rawModelOutput as any,
      modelVersion: result.modelVersion,
    },
  })

  return result
}

export function startAiValidationWorker() {
  const worker = new Worker("ai-validation", processValidation, {
    connection: redisConnection,
    concurrency: 2,
  })

  worker.on("completed", (job) => {
    console.log(`AI validation completed for submission ${job.data.submissionId}`)
  })

  worker.on("failed", (job, err) => {
    console.error(`AI validation failed for submission ${job?.data.submissionId}:`, err)
  })

  return worker
}

export async function queueAiValidation(submissionId: string) {
  await aiValidationQueue.add("validate", { submissionId }, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
  })
}
