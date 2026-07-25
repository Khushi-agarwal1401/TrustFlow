import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || ""
  const minBudget = parseInt(searchParams.get("minBudget") || "0")
  const maxBudget = parseInt(searchParams.get("maxBudget") || "999999999")
  const sort = searchParams.get("sort") || "newest"

  const where: Record<string, unknown> = {
    isListed: true,
    status: "AWAITING_FUNDING",
    totalAmount: { gte: minBudget, lte: maxBudget },
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  const orderBy = sort === "budget_asc" ? { totalAmount: "asc" as const }
    : sort === "budget_desc" ? { totalAmount: "desc" as const }
    : { listedAt: "desc" as const }

  const projects = await prisma.project.findMany({
    where: where as any,
    orderBy,
    include: {
      client: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { proposals: true } },
    },
    take: 50,
  })

  return NextResponse.json(projects)
}
