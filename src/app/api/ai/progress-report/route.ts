import { NextRequest, NextResponse } from "next/server"
import { getAuthUser, requireAuth } from "@/lib/api-helpers"
import { progressReport } from "@/lib/ai-copilot"

export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  const error = requireAuth(user)
  if (error) return error

  const { projectTitle, milestones } = await request.json()

  if (!projectTitle || !milestones) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const result = await progressReport(projectTitle, milestones)
    return NextResponse.json(result)
  } catch (err) {
    console.error("AI progress report error:", err)
    return NextResponse.json({ error: "Failed to generate progress report" }, { status: 500 })
  }
}
