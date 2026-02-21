import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  const email = await db.email.findFirst({
    where: { id, userId },
  })

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(email)
}
