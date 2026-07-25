import { GoogleGenerativeAI } from "@google/generative-ai"

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

export function getGeminiModel(config?: {
  temperature?: number
  maxOutputTokens?: number
  responseMimeType?: string
}) {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: config?.temperature ?? 0.7,
      maxOutputTokens: config?.maxOutputTokens ?? 2000,
      ...(config?.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
    },
  })
}
