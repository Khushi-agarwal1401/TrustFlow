import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the gemini module so all ai-* functions use a controlled generateContent
const mockGenerateContent = vi.fn()
vi.mock("@/lib/gemini", () => ({
  getGeminiModel: vi.fn(() => ({
    generateContent: mockGenerateContent,
  })),
}))

import { generateContractFromDescription } from "@/lib/ai-contract"
import { splitMilestones, predictDeadline, progressReport } from "@/lib/ai-copilot"
import { validateSubmission } from "@/lib/ai-validator"
import { suggestDisputeResolution } from "@/lib/ai-dispute"

// ──────────────────────────────────────────────
//  ai-contract.ts
// ──────────────────────────────────────────────
describe("generateContractFromDescription", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should parse valid Gemini response into contract output", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            milestones: [
              { title: "Research", description: "Initial research phase", amount: 2000 },
              { title: "Development", description: "Build the product", amount: 5000 },
              { title: "Delivery", description: "Final delivery", amount: 3000 },
            ],
            terms: "Standard 30-day payment terms.",
          }),
      },
    })

    const result = await generateContractFromDescription("Build a website", 100)

    expect(result.milestones).toHaveLength(3)
    expect(result.terms).toBe("Standard 30-day payment terms.")
    const total = result.milestones.reduce((s, m) => s + m.amount, 0)
    expect(total).toBe(10000) // 100 dollars * 100 cents
  })

  it("should scale milestone amounts to match budget exactly", async () => {
    // Returned amounts sum to 20000 but budget is 10000 (100 dollars * 100)
    // Scale = 10000/20000 = 0.5, which divides cleanly
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            milestones: [
              { title: "Research", description: "Research", amount: 8000 },
              { title: "Build", description: "Build", amount: 8000 },
              { title: "Test", description: "Test", amount: 4000 },
            ],
            terms: "Terms here.",
          }),
      },
    })

    const result = await generateContractFromDescription("App", 100)
    const total = result.milestones.reduce((s, m) => s + m.amount, 0)
    // Should be scaled to exactly 10000 cents
    expect(total).toBe(10000)
  })

  it("should throw when less than 2 milestones returned", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            milestones: [{ title: "All", description: "All work", amount: 10000 }],
            terms: "Terms.",
          }),
      },
    })

    await expect(generateContractFromDescription("Project", 100)).rejects.toThrow(
      "Invalid contract structure from AI"
    )
  })

  it("should throw when milestones array is missing", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ terms: "Terms." }),
      },
    })

    await expect(generateContractFromDescription("Project", 100)).rejects.toThrow(
      "Invalid contract structure from AI"
    )
  })

  it("should throw on empty Gemini response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "",
      },
    })

    await expect(generateContractFromDescription("Project", 100)).rejects.toThrow(
      "Empty response from Gemini"
    )
  })

  it("should throw on malformed JSON", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "not-json-at-all",
      },
    })

    await expect(generateContractFromDescription("Project", 100)).rejects.toThrow()
  })

  it("should preserve amounts when they already sum correctly", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            milestones: [
              { title: "A", description: "A", amount: 5000 },
              { title: "B", description: "B", amount: 5000 },
            ],
            terms: "Terms.",
          }),
      },
    })

    const result = await generateContractFromDescription("Site", 100)
    const total = result.milestones.reduce((s, m) => s + m.amount, 0)
    expect(total).toBe(10000)
    // Should keep exact values since they already sum to 10000
    expect(result.milestones[0].amount).toBe(5000)
    expect(result.milestones[1].amount).toBe(5000)
  })

  it("should handle budget of 0.50 cents", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            milestones: [
              { title: "A", description: "A", amount: 25 },
              { title: "B", description: "B", amount: 25 },
            ],
            terms: "Terms.",
          }),
      },
    })

    // budget = 0.5 means 50 cents
    const result = await generateContractFromDescription("Mini", 0.5)
    const total = result.milestones.reduce((s, m) => s + m.amount, 0)
    expect(total).toBe(50)
  })
})

// ──────────────────────────────────────────────
//  ai-copilot.ts
// ──────────────────────────────────────────────
describe("splitMilestones", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return parsed milestone data from Gemini", async () => {
    const milestones = [
      { title: "Design", description: "Design phase", amount: 2500 },
      { title: "Code", description: "Development", amount: 5000 },
      { title: "Deploy", description: "Deployment", amount: 2500 },
    ]
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({ milestones }),
      },
    })

    const result = await splitMilestones("Build an e-commerce site", 10000, 3)
    expect(result.milestones).toHaveLength(3)
    expect(result.milestones[0].title).toBe("Design")
  })

  it("should throw on empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "",
      },
    })

    await expect(splitMilestones("Test", 5000, 2)).rejects.toThrow("Empty response")
  })
})

describe("predictDeadline", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return predicted deadline with confidence", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            estimatedDays: 45,
            confidence: "medium",
            reasoning: "Project is complex with multiple milestones.",
          }),
      },
    })

    const result = await predictDeadline("Build a mobile app", 5, 50000)
    expect(result.estimatedDays).toBe(45)
    expect(result.confidence).toBe("medium")
    expect(result.reasoning).toBeTruthy()
  })

  it("should be able to return high confidence", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            estimatedDays: 10,
            confidence: "high",
            reasoning: "Simple project.",
          }),
      },
    })

    const result = await predictDeadline("Fix bugs", 2, 10000)
    expect(result.confidence).toBe("high")
  })

  it("should be able to return low confidence", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            estimatedDays: 90,
            confidence: "low",
            reasoning: "Vague requirements.",
          }),
      },
    })

    const result = await predictDeadline("Something", 10, 100000)
    expect(result.confidence).toBe("low")
  })
})

describe("progressReport", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should generate a report with suggestions when behind", async () => {
    const milestones = [
      { title: "Research", status: "APPROVED" },
      { title: "Design", status: "IN_PROGRESS" },
      { title: "Development", status: "PENDING" },
    ]
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            summary: "Project is progressing but behind schedule.",
            onTrack: false,
            suggestions: ["Focus on completing the design phase."],
          }),
      },
    })

    const result = await progressReport("Website", milestones)
    expect(result.summary).toBeTruthy()
    expect(result.onTrack).toBe(false)
    expect(result.suggestions).toHaveLength(1)
  })

  it("should indicate on track when all milestones approved", async () => {
    const milestones = [
      { title: "Done", status: "APPROVED" },
      { title: "Also Done", status: "APPROVED" },
    ]
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            summary: "All milestones completed.",
            onTrack: true,
            suggestions: [],
          }),
      },
    })

    const result = await progressReport("Quick Project", milestones)
    expect(result.onTrack).toBe(true)
    expect(result.suggestions).toEqual([])
  })
})

// ──────────────────────────────────────────────
//  ai-validator.ts
// ──────────────────────────────────────────────
describe("validateSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return HIGH confidence when evidence matches deliverable", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            matchSummary: "The submission matches the deliverable description.",
            confidence: "HIGH",
          }),
      },
    })

    const result = await validateSubmission(
      "Build a landing page with 3 sections",
      "Built landing page with hero, features, and pricing sections",
      ["https://example.com/page"],
      null
    )

    expect(result.confidence).toBe("HIGH")
    expect(result.matchSummary).toBeTruthy()
    expect(result.modelVersion).toBe("gemini-2.0-flash")
  })

  it("should return NEEDS_REVIEW when evidence is ambiguous", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            matchSummary: "Only partial match found. Some features are missing.",
            confidence: "NEEDS_REVIEW",
          }),
      },
    })

    const result = await validateSubmission(
      "Full app with auth and payments",
      "Basic app with login",
      ["https://example.com/demo"],
      null
    )

    expect(result.confidence).toBe("NEEDS_REVIEW")
  })

  it("should return NEEDS_REVIEW when confidence is unknown", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            matchSummary: "Could not determine match quality.",
            confidence: "UNKNOWN",
          }),
      },
    })

    const result = await validateSubmission("Desc", "Sub", [], null)
    expect(result.confidence).toBe("NEEDS_REVIEW")
  })

  it("should include link evidence in the prompt", async () => {
    mockGenerateContent.mockImplementation(async (parts: Array<{ text: string }>) => {
      const userContent = JSON.parse(parts[1].text)
      expect(userContent.linkEvidence).toHaveLength(1)
      return {
        response: {
          text: () =>
            JSON.stringify({
              matchSummary: "Evidence reviewed.",
              confidence: "HIGH",
            }),
        },
      }
    })

    const result = await validateSubmission(
      "Build a design",
      "Created design",
      [],
      [{ type: "figma", url: "https://figma.com/file/abc", label: "Design File" }]
    )

    expect(result.confidence).toBe("HIGH")
  })

  it("should fallback gracefully on API error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Network error"))

    const result = await validateSubmission("Desc", "Sub", [], null)

    expect(result.confidence).toBe("NEEDS_REVIEW")
    expect(result.matchSummary).toContain("AI validation is temporarily unavailable")
    expect(result.rawModelOutput).toBeNull()
    expect(result.modelVersion).toBe("gemini-2.0-flash")
  })

  it("should fallback gracefully on empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "",
      },
    })

    const result = await validateSubmission("Desc", "Sub", [], null)

    expect(result.confidence).toBe("NEEDS_REVIEW")
    expect(result.matchSummary).toContain("AI validation is temporarily unavailable")
  })

  it("should handle missing linkEvidence gracefully", async () => {
    mockGenerateContent.mockImplementation(async (parts: Array<{ text: string }>) => {
      const userContent = JSON.parse(parts[1].text)
      expect(userContent.linkEvidence).toBeNull()
      return {
        response: {
          text: () =>
            JSON.stringify({
              matchSummary: "No links provided.",
              confidence: "NEEDS_REVIEW",
            }),
        },
      }
    })

    const result = await validateSubmission("Desc", "Sub", [], null)
    expect(result.confidence).toBe("NEEDS_REVIEW")
  })

  it("should handle empty fileUrls gracefully", async () => {
    mockGenerateContent.mockImplementation(async (parts: Array<{ text: string }>) => {
      const userContent = JSON.parse(parts[1].text)
      expect(userContent.fileUrls).toEqual([])
      return {
        response: {
          text: () =>
            JSON.stringify({
              matchSummary: "No files submitted.",
              confidence: "NEEDS_REVIEW",
            }),
        },
      }
    })

    const result = await validateSubmission("Desc", "Sub", [], null)
    expect(result.confidence).toBe("NEEDS_REVIEW")
  })
})

// ──────────────────────────────────────────────
//  ai-dispute.ts
// ──────────────────────────────────────────────
describe("suggestDisputeResolution", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return a suggested resolution from Gemini", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            summary: "The freelancer should be paid for completed work.",
            citedClause: "Milestone 3 deliverable: 'Fully functional dashboard'",
            citedEvidence: "Freelancer provided screenshots of the dashboard.",
          }),
      },
    })

    const result = await suggestDisputeResolution(
      "Contract terms here",
      "Milestone 3 - Dashboard",
      "Fully functional dashboard",
      "I did the work, here's proof",
      ["https://screenshot.com/dashboard.png"],
      "Work was incomplete",
      ["https://screenshot.com/broken.png"]
    )

    expect(result).not.toBeNull()
    expect(result!.summary).toBeTruthy()
    expect(result!.citedClause).toBeTruthy()
    expect(result!.citedEvidence).toBeTruthy()
  })

  it("should return null when Gemini returns empty response", async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => "",
      },
    })

    const result = await suggestDisputeResolution("Terms", "Milestone", "Desc", "Opener", [], "Respondent", [])
    expect(result).toBeNull()
  })

  it("should return null on API error", async () => {
    mockGenerateContent.mockRejectedValue(new Error("Service unavailable"))

    const result = await suggestDisputeResolution("Terms", "Milestone", "Desc", "Opener", [], "Respondent", [])
    expect(result).toBeNull()
  })

  it("should include all parties' evidence in the prompt", async () => {
    const openerEvidence = ["https://evidence.com/doc1", "https://evidence.com/doc2"]
    const respondentEvidence = ["https://evidence.com/respondent"]

    mockGenerateContent.mockImplementation(async (parts: Array<{ text: string }>) => {
      const userContent = JSON.parse(parts[1].text)
      expect(userContent.openerEvidence).toEqual(openerEvidence)
      expect(userContent.respondentEvidence).toEqual(respondentEvidence)
      return {
        response: {
          text: () =>
            JSON.stringify({
              summary: "Fair resolution.",
              citedClause: "Clause 1",
              citedEvidence: "Both sides",
            }),
        },
      }
    })

    const result = await suggestDisputeResolution(
      "Terms",
      "M1",
      "Desc",
      "Statement",
      openerEvidence,
      "Response",
      respondentEvidence
    )

    expect(result).not.toBeNull()
  })
})
