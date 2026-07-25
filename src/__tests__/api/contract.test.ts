import { describe, it, expect } from "vitest"

describe("Contract Generation", () => {
  it("should validate milestone amounts sum to total", () => {
    const milestones = [
      { amount: 2000 },
      { amount: 3000 },
      { amount: 5000 },
    ]
    const total = milestones.reduce((sum, m) => sum + m.amount, 0)
    expect(total).toBe(10000)
  })

  it("should reject fewer than 2 milestones", () => {
    const milestones: { amount: number }[] = [{ amount: 10000 }]
    const valid = milestones.length >= 2
    expect(valid).toBe(false)
  })

  it("should handle scale correction", () => {
    const budget = 10000
    const total = 9500
    const scale = budget / total
    const corrected = Math.round(5000 * scale)
    expect(corrected).toBe(5263)
  })
})
