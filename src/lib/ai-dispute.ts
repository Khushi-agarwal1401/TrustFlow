import { openai } from "./openai"

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
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a dispute resolution assistant for a freelance escrow platform.

Given the contract terms, milestone details, and statements from both sides, suggest a fair resolution.

Rules:
- Be objective and base your suggestion on the contract terms and evidence provided
- Cite the specific clause or deliverable description that supports your reasoning
- Cite which party's evidence supports the conclusion
- Return ONLY valid JSON with: summary (string), citedClause (string), citedEvidence (string)
- The resolution is non-binding — it's an advisory suggestion`,
        },
        {
          role: "user",
          content: JSON.stringify({
            contractTerms,
            milestoneTitle,
            deliverableDescription,
            openerStatement,
            openerEvidence,
            respondentStatement,
            respondentEvidence,
          }),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return null

    return JSON.parse(content) as SuggestedResolution
  } catch {
    return null
  }
}
