import { prisma } from "@/lib/prisma"
import { computeAndStoreRiskSignal } from "@/lib/risk-signals"
import { riskSignalQueue, redisConnection } from "@/lib/queue"
import { Worker } from "bullmq"

async function processRiskSignal(job: { data: { projectId: string } }) {
  const { projectId } = job.data
  return await computeAndStoreRiskSignal(projectId)
}

export function startRiskSignalWorker() {
  const worker = new Worker("risk-signal", processRiskSignal, {
    connection: redisConnection,
    concurrency: 5,
  })

  worker.on("completed", (job) => {
    console.log(`Risk signal computed for project ${job.data.projectId}`)
  })

  worker.on("failed", (job, err) => {
    console.error(`Risk signal failed for project ${job?.data.projectId}:`, err)
  })

  return worker
}

export async function queueRiskSignal(projectId: string) {
  await riskSignalQueue.add("compute", { projectId }, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
  })
}

export async function computeRiskSignalsForAllProjects() {
  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["COMPLETED", "CANCELLED", "DECLINED"] } },
    select: { id: true },
  })

  for (const project of projects) {
    await queueRiskSignal(project.id)
  }
}
