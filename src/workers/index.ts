/**
 * TrustFlow AI — Worker Bootstrap
 *
 * Entry point for background job processors (BullMQ).
 * Starts all workers and handles graceful shutdown for Docker/SIGTERM.
 *
 * Usage:
 *   npx tsx src/workers/index.ts
 *
 * Or via Docker (docker-compose.prod.yml):
 *   node dist/workers/index.js   (requires compilation)
 */

import { startAiValidationWorker } from "./ai-validation"
import { startRiskSignalWorker } from "./risk-signal"

function main() {
  console.log("[workers] Booting TrustFlow AI workers...")

  // Start AI validation worker — processes milestone submission reviews via GPT-4o
  const aiValidationWorker = startAiValidationWorker()
  console.log("[workers] AI validation worker started (queue: ai-validation, concurrency: 2)")

  // Start risk signal worker — computes project risk assessments (overdue, inactivity, revisions)
  const riskSignalWorker = startRiskSignalWorker()
  console.log("[workers] Risk signal worker started (queue: risk-signal, concurrency: 5)")

  // Contract PDF generation worker — queue exists but no worker implemented yet
  console.log("[workers] Notice: contract-pdf queue has no worker — PDF generation not available")

  // Graceful shutdown
  async function shutdown() {
    console.log("\n[workers] Shutting down gracefully...")
    await Promise.all([
      aiValidationWorker.close(),
      riskSignalWorker.close(),
    ])
    console.log("[workers] All workers closed")
    process.exit(0)
  }

  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
}

main()
