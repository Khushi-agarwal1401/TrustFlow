import { getGeminiModel } from "./gemini"

export interface SuggestedResolution {
  summary: string
  citedClause: string
  citedEvidence: string
}

export async function suggestDisputeResolution(
  contractTerms: string,
  milestoneTitle: string,
  deliverableDescription: string,
  openerStatement: string,
  openerEvidence: string[],
  respondentStatement: string,
  respondentEvidence: string[]
): Promise<SuggestedResolution | null> {
  try {
    const model = getGeminiModel({
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    })

    const systemPrompt = `You are a dispute resolution assistant for a freelance escrow platform.

Given the contract terms, milestone details, and statements from both sides, suggest a fair resolution.

Rules:
- Be objective and base your suggestion on the contract terms and evidence provided
- Cite the specific clause or deliverable description that supports your reasoning
- Cite which party's evidence supports the conclusion
- Return ONLY valid JSON with: summary (string), citedClause (string), citedEvidence (string)
- The resolution is non-binding — it's an advisory suggestion`

    const userContent = JSON.stringify({
      contractTerms,
      milestoneTitle,
      deliverableDescription,
      openerStatement,
      openerEvidence,
      respondentStatement,
      respondentEvidence,
    })

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userContent },
    ])
    const content = result.response.text()
    if (!content) return null

    return JSON.parse(content) as SuggestedResolution
  } catch {
    return null
  }
}
