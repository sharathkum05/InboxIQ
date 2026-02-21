import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.SLACK_CLIENT_ID
  const redirectUri = process.env.SLACK_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Slack is not configured" },
      { status: 500 }
    )
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "chat:write,channels:read,incoming-webhook",
    redirect_uri: redirectUri,
    state: userId,
  })

  const url = `https://slack.com/oauth/v2/authorize?${params.toString()}`
  return NextResponse.redirect(url)
}
