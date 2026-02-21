import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import { Provider } from "@prisma/client"

const SLACK_TOKEN_URL = "https://slack.com/api/oauth.v2.access"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.url
  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, baseUrl))

  try {
    const { userId } = await auth()
    if (!userId) {
      return redirectTo("/dashboard?slack=error")
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || state !== userId) {
      return redirectTo("/dashboard?slack=error")
    }

    const clientId = process.env.SLACK_CLIENT_ID
    const clientSecret = process.env.SLACK_CLIENT_SECRET
    const redirectUri = process.env.SLACK_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      return redirectTo("/dashboard?slack=error")
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    })

    const tokenRes = await fetch(SLACK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    const data = (await tokenRes.json()) as {
      ok?: boolean
      error?: string
      access_token?: string
      scope?: string
      team?: { name?: string }
      incoming_webhook?: { url?: string }
    }

    if (!data.ok || !data.access_token) {
      console.error("[Slack callback] Token exchange failed:", data.error ?? tokenRes.status)
      return redirectTo("/dashboard?slack=error")
    }

    const encryptedAccess = encrypt(data.access_token)
    const webhookUrl = data.incoming_webhook?.url ?? null

    await db.oAuthToken.upsert({
      where: {
        userId_provider: { userId, provider: Provider.SLACK },
      },
      create: {
        userId,
        provider: Provider.SLACK,
        accessToken: encryptedAccess,
        scope: data.scope ?? null,
        webhookUrl,
      },
      update: {
        accessToken: encryptedAccess,
        scope: data.scope ?? null,
        webhookUrl,
        tokenInvalid: false,
      },
    })

    return redirectTo("/dashboard?slack=connected")
  } catch {
    return redirectTo("/dashboard?slack=error")
  }
}
