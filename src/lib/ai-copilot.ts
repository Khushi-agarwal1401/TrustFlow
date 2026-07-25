import { getGeminiModel } from "@/lib/gemini"

export async function splitMilestones(description: string, totalAmount: number, count: number) {
  const prompt = `Split this project into ${count} logical milestones:

Project: "${description}"
Total budget: $${(totalAmount / 100).toLocaleString()}

Rules:
- Each milestone must have a title, description, and amount
- Amounts sum to the total budget
- Amounts are in cents (integers)
- Order them logically

Return JSON: { "milestones": [{ "title": "string", "description": "string", "amount": number }] }`

  const model = getGeminiModel({
    temperature: 0.7,
    maxOutputTokens: 2000,
    responseMimeType: "application/json",
  })

  const result = await model.generateContent(prompt)
  const content = result.response.text()
  if (!content) throw new Error("Empty response")
  return JSON.parse(content)
}

export async function predictDeadline(description: string, milestones: number, budget: number) {
  const prompt = `Given a freelance project, predict a realistic completion timeline:

Project: "${description}"
Milestones: ${milestones}
Budget: $${(budget / 100).toLocaleString()}

Return JSON: { "estimatedDays": number, "confidence": "high" | "medium" | "low", "reasoning": "string" }`

  const model = getGeminiModel({
    temperature: 0.5,
    maxOutputTokens: 500,
    responseMimeType: "application/json",
  })

  const result = await model.generateContent(prompt)
  const content = result.response.text()
  if (!content) throw new Error("Empty response")
  return JSON.parse(content)
}

export async function progressReport(projectTitle: string, milestones: { title: string; status: string }[]) {
  const completed = milestones.filter((m) => m.status === "APPROVED").length
  const total = milestones.length
  const prompt = `Generate a brief AI progress report for a freelance project:

Project: "${projectTitle}"
Progress: ${completed}/${total} milestones completed
Statuses: ${milestones.map((m) => `${m.title}: ${m.status}`).join(", ")}

Return JSON: { "summary": "string", "onTrack": boolean, "suggestions": ["string"] }`

  const model = getGeminiModel({
    temperature: 0.5,
    maxOutputTokens: 500,
    responseMimeType: "application/json",
  })

  const result = await model.generateContent(prompt)
  const content = result.response.text()
  if (!content) throw new Error("Empty response")
  return JSON.parse(content)
}
