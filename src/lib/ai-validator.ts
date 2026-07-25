import { getGeminiModel } from "./gemini"

export interface ValidationResult {
  matchSummary: string
  confidence: "HIGH" | "NEEDS_REVIEW"
  rawModelOutput: unknown
  modelVersion: string
}

export async function validateSubmission(
  deliverableDescription: string,
  submissionDescription: string,
  fileUrls: string[],
  linkEvidence: Array<{ type: string; url: string; label: string }> | null
): Promise<ValidationResult> {
  const modelVersion = "gemini-2.0-flash"

  try {
    const model = getGeminiModel({
      temperature: 0.7,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    })

    const systemPrompt = `You are a scope validation assistant for a freelance escrow platform.

Your job: compare the submitted work evidence against the agreed deliverable description and determine if the scope has been met.

Rules:
- Be objective and evidence-based
- If the evidence clearly matches the deliverable, set confidence to HIGH
- If it's ambiguous, partial, or lacks sufficient evidence, set confidence to NEEDS_REVIEW
- Write a concise plain-language match summary (2-3 sentences) explaining your reasoning
- The match summary will be shown to the client as an advisory aid — never as an auto-approval
- Return ONLY valid JSON with fields: matchSummary (string), confidence ("HIGH" | "NEEDS_REVIEW")`

    const userContent = JSON.stringify({
      agreedDeliverable: deliverableDescription,
      submittedDescription: submissionDescription,
      fileUrls,
      linkEvidence,
    })

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userContent },
    ])
    const content = result.response.text()
    if (!content) throw new Error("No response from AI")

    const parsed = JSON.parse(content) as ValidationResult
    return {
      matchSummary: parsed.matchSummary,
      confidence: parsed.confidence === "HIGH" ? "HIGH" : "NEEDS_REVIEW",
      rawModelOutput: parsed,
      modelVersion,
    }
  } catch {
    return {
      matchSummary:
        "AI validation is temporarily unavailable. Please review the submission manually.",
      confidence: "NEEDS_REVIEW",
      rawModelOutput: null,
      modelVersion,
    }
  }
}
