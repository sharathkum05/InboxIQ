import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { PriorityLevel, Prisma } from "@prisma/client"

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get("page") ?? String(DEFAULT_PAGE), 10) || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get("limit") ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  )
  const priority = searchParams.get("priority") as PriorityLevel | null
  const search = searchParams.get("search")?.trim() ?? ""

  const where: Prisma.EmailWhereInput = {
    userId,
    dismissed: false,
  }

  if (priority && Object.values(PriorityLevel).includes(priority)) {
    where.priorityLevel = priority
  }

  if (search) {
    where.OR = [
      { subject: { contains: search, mode: "insensitive" } },
      { from: { contains: search, mode: "insensitive" } },
    ]
  }

  const [emails, total] = await Promise.all([
    db.email.findMany({
      where,
      orderBy: [{ urgencyScore: "desc" }, { receivedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.email.count({ where }),
  ])

  const hasMore = page * limit < total

  return NextResponse.json({
    emails,
    total,
    page,
    limit,
    hasMore,
  })
}
