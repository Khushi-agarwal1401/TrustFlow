import { gemini } from "./gemini"

interface MilestoneInput {
  title: string
  description: string
  amount: number
}

interface ContractOutput {
  milestones: MilestoneInput[]
  terms: string
}

export async function generateContractFromDescription(
  description: string,
  budget: number
): Promise<ContractOutput> {
  const prompt = `You are a smart contract generator for freelance projects.

Given the following project description and total budget, generate a set of milestones for an escrow-based contract.

Project description: "${description}"
Total budget: $${budget}

Rules:
- Break the work into 2-6 logical milestones
- Each milestone must have a title, description, and amount
- The sum of all milestone amounts must equal exactly the total budget
- Amounts must be integers (representing cents)

Return JSON exactly in this format (no markdown, no code fences):
{
  "milestones": [
    { "title": "string", "description": "string", "amount": number }
  ],
  "terms": "string (a short paragraph of standard freelance terms)"
}`

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 2000,
    }
  })

  const content = response.text
  if (!content) throw new Error("Empty response from Gemini")

  const parsed = JSON.parse(content) as ContractOutput

  if (!parsed.milestones || !Array.isArray(parsed.milestones) || parsed.milestones.length < 2) {
    throw new Error("Invalid contract structure from AI")
  }

  const totalFromMilestones = parsed.milestones.reduce((sum, m) => sum + m.amount, 0)
  if (totalFromMilestones !== budget * 100) {
    const scale = (budget * 100) / totalFromMilestones
    parsed.milestones = parsed.milestones.map((m) => ({
      ...m,
      amount: Math.round(m.amount * scale),
    }))
  }

  return parsed
}
