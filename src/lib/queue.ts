import { Queue } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
})

export const aiValidationQueue = new Queue("ai-validation", { connection })
export const riskSignalQueue = new Queue("risk-signal", { connection })
export const contractPdfQueue = new Queue("contract-pdf", { connection })

export { connection as redisConnection }
