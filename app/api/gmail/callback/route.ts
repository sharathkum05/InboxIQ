import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { encrypt } from "@/lib/encryption"
import { Provider } from "@prisma/client"

const TOKEN_URL = "https://oauth2.googleapis.com/token"

/** Max length for error message in URL to avoid overly long redirects */
const MAX_MESSAGE_LENGTH = 200

function sanitizeMessage(msg: string): string {
  const safe = msg.replace(/[^\w\s\-.,:;!?]/g, " ").trim()
  return safe.length > MAX_MESSAGE_LENGTH ? safe.slice(0, MAX_MESSAGE_LENGTH) + "…" : safe
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.url

  const redirectTo = (path: string) =>
    NextResponse.redirect(new URL(path, baseUrl))

  const redirectToError = (message?: string) => {
    const params = new URLSearchParams({ gmail: "error" })
    if (message) params.set("message", encodeURIComponent(sanitizeMessage(message)))
    return NextResponse.redirect(new URL(`/dashboard?${params.toString()}`, baseUrl))
  }

  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user?.emailAddresses?.[0]?.emailAddress) {
      console.error("[Gmail callback] Auth failed: missing userId or user email", { userId, hasUser: !!user })
      return redirectToError("Missing sign-in or email")
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code) {
      console.error("[Gmail callback] Missing code in callback", { state: state ?? "(none)" })
      return redirectToError("Authorization code missing")
    }
    if (state !== userId) {
      console.error("[Gmail callback] State verification failed", { state, expectedUserId: userId })
      return redirectToError("Invalid state; please try again")
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("[Gmail callback] Missing env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REDIRECT_URI")
      return redirectToError("Server configuration error")
    }

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    })

    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error("[Gmail callback] Token exchange failed:", tokenRes.status, errText)
      let errMessage = "Token exchange failed"
      try {
        const errJson = JSON.parse(errText) as { error_description?: string; error?: string }
        errMessage = errJson.error_description ?? errJson.error ?? errMessage
      } catch {
        errMessage = errText.slice(0, 100) || errMessage
      }
      return redirectToError(errMessage)
    }

    const data = (await tokenRes.json()) as {
      access_token: string
      refresh_token?: string
      expires_in?: number
    }

    const email = user.emailAddresses[0].emailAddress
    const name = user.firstName || user.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : null

    const tokenExpiry = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : null

    const encryptedAccess = encrypt(data.access_token)
    const encryptedRefresh = data.refresh_token
      ? encrypt(data.refresh_token)
      : null

    try {
      await db.user.upsert({
        where: { id: userId },
        create: {
          id: userId,
          email,
          name,
        },
        update: {
          email,
          name,
        },
      })
    } catch (dbErr) {
      console.error("[Gmail callback] User upsert failed:", dbErr)
      return redirectToError(dbErr instanceof Error ? dbErr.message : "Database error (user)")
    }

    try {
      await db.oAuthToken.upsert({
        where: {
          userId_provider: { userId, provider: Provider.GMAIL },
        },
        create: {
          userId,
          provider: Provider.GMAIL,
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          tokenExpiry,
          tokenInvalid: false,
        },
        update: {
          accessToken: encryptedAccess,
          refreshToken: encryptedRefresh,
          tokenExpiry,
          tokenInvalid: false,
        },
      })
    } catch (dbErr) {
      console.error("[Gmail callback] OAuthToken upsert failed:", dbErr)
      return redirectToError(dbErr instanceof Error ? dbErr.message : "Database error (tokens)")
    }

    return redirectTo("/dashboard?gmail=connected")
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Gmail callback] Unexpected error:", err)
    return redirectToError(message)
  }
}
