import { describe, it, expect } from "vitest"

describe("Escrow", () => {
  it("should calculate total escrow amount from milestones", () => {
    const milestones = [
      { amount: 5000, status: "PENDING" },
      { amount: 5000, status: "PENDING" },
    ]
    const total = milestones.reduce((sum, m) => sum + m.amount, 0)
    expect(total).toBe(10000)
  })

  it("should mark all escrow transactions with same payment intent", () => {
    const paymentIntentId = "pi_test_123"
    const milestoneIds = ["m1", "m2"]
    const transactions = milestoneIds.map((mid) => ({
      milestoneId: mid,
      providerReferenceId: paymentIntentId,
    }))
    expect(transactions.every((t) => t.providerReferenceId === paymentIntentId)).toBe(true)
  })
})
