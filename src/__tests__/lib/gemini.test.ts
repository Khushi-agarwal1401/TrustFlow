import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock @google/generative-ai to avoid real API calls
// Use vi.hoisted so the mock variable is available when vi.mock is hoisted
const mockGetGenerativeModel = vi.hoisted(() => vi.fn())
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn(function () {
    return { getGenerativeModel: mockGetGenerativeModel }
  }),
}))

// Import AFTER vi.mock so the mock is applied
import { getGeminiModel } from "@/lib/gemini"

describe("Gemini client factory", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should create a model with default generation config", () => {
    mockGetGenerativeModel.mockReturnValue({ name: "default-model" })

    const model = getGeminiModel()

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    })
    expect(model).toEqual({ name: "default-model" })
  })

  it("should override temperature when provided", () => {
    mockGetGenerativeModel.mockReturnValue({ name: "low-temp-model" })

    getGeminiModel({ temperature: 0.3 })

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
    })
  })

  it("should override maxOutputTokens when provided", () => {
    mockGetGenerativeModel.mockReturnValue({})

    getGeminiModel({ maxOutputTokens: 500 })

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    })
  })

  it("should set responseMimeType when provided", () => {
    mockGetGenerativeModel.mockReturnValue({})

    getGeminiModel({ responseMimeType: "application/json" })

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    })
  })

  it("should omit responseMimeType when not provided", () => {
    mockGetGenerativeModel.mockReturnValue({})

    getGeminiModel({ temperature: 0.5 })

    const call = mockGetGenerativeModel.mock.calls[0][0]
    expect(call.generationConfig).not.toHaveProperty("responseMimeType")
  })

  it("should accept all config options simultaneously", () => {
    mockGetGenerativeModel.mockReturnValue({})

    getGeminiModel({
      temperature: 0.2,
      maxOutputTokens: 1000,
      responseMimeType: "application/json",
    })

    expect(mockGetGenerativeModel).toHaveBeenCalledWith({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
    })
  })
})
