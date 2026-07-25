import { NextResponse } from "next/server"
import { prisma } from "./prisma"

export async function authenticateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing or invalid API key" }, { status: 401 }), user: null }
  }

  const key = authHeader.slice(7)
  const hashedKey = await hashApiKey(key)

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hashedKey },
    include: { user: true },
  })

  if (!apiKey) {
    return { error: NextResponse.json({ error: "Invalid API key" }, { status: 401 }), user: null }
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: NextResponse.json({ error: "API key expired" }, { status: 401 }), user: null }
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return { error: null, user: apiKey.user, key: apiKey }
}

export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("")
}
