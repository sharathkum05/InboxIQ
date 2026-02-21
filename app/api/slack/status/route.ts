import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { checkSlackConnected } from "@/lib/slack"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const connected = await checkSlackConnected(userId)
    return NextResponse.json({ connected })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
