import { openai } from "@/lib/openai"

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

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  })

  const content = res.choices[0]?.message?.content
  if (!content) throw new Error("Empty response")
  return JSON.parse(content)
}

export async function predictDeadline(description: string, milestones: number, budget: number) {
  const prompt = `Given a freelance project, predict a realistic completion timeline:

Project: "${description}"
Milestones: ${milestones}
Budget: $${(budget / 100).toLocaleString()}

Return JSON: { "estimatedDays": number, "confidence": "high" | "medium" | "low", "reasoning": "string" }`

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 500,
  })

  const content = res.choices[0]?.message?.content
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

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 500,
  })

  const content = res.choices[0]?.message?.content
  if (!content) throw new Error("Empty response")
  return JSON.parse(content)
}
