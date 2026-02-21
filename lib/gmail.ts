import { google, gmail_v1 } from "googleapis"
import { db } from "@/lib/db"
import { decrypt, encrypt } from "@/lib/encryption"
import { Provider } from "@prisma/client"

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const FIVE_MINUTES_MS = 5 * 60 * 1000
const LABEL_NAME_AI_PROCESSED = "AI_PROCESSED"
const MAX_MESSAGES = 50

export interface EmailData {
  gmailMessageId: string
  threadId?: string
  from: string
  fromName?: string
  subject: string
  body: string
  snippet?: string
  receivedAt: Date
}

function getOAuth2Client(accessToken: string) {
  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  oauth2.setCredentials({ access_token: accessToken })
  return oauth2
}

/**
 * Fetch Gmail OAuth token, refresh if expired or within 5 minutes, return Gmail client.
 */
export async function getGmailClient(userId: string): Promise<gmail_v1.Gmail> {
  const token = await db.oAuthToken.findUnique({
    where: {
      userId_provider: { userId, provider: Provider.GMAIL },
    },
  })

  if (!token || token.tokenInvalid) {
    throw new Error("GMAIL_NOT_CONNECTED")
  }

  let accessToken = decrypt(token.accessToken)
  let refreshToken: string | null = token.refreshToken
    ? decrypt(token.refreshToken)
    : null
  let tokenExpiry = token.tokenExpiry

  const now = Date.now()
  const expiryMs = tokenExpiry ? tokenExpiry.getTime() : 0
  if (tokenExpiry && (expiryMs <= now || expiryMs - now <= FIVE_MINUTES_MS)) {
    if (!refreshToken) {
      await db.oAuthToken.update({
        where: { id: token.id },
        data: { tokenInvalid: true },
      })
      throw new Error("GMAIL_TOKEN_INVALID")
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      throw new Error("Server misconfiguration: missing Google OAuth env")
    }

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    })

    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as { error?: string }
      if (err.error === "invalid_grant") {
        await db.oAuthToken.update({
          where: { id: token.id },
          data: { tokenInvalid: true },
        })
        throw new Error("GMAIL_TOKEN_INVALID")
      }
      throw new Error("Gmail token refresh failed")
    }

    const data = (await res.json()) as {
      access_token: string
      expires_in?: number
    }
    accessToken = data.access_token
    tokenExpiry = data.expires_in
      ? new Date(Date.now() + data.expires_in * 1000)
      : null

    await db.oAuthToken.update({
      where: { id: token.id },
      data: {
        accessToken: encrypt(data.access_token),
        tokenExpiry,
      },
    })
  }

  const auth = getOAuth2Client(accessToken)
  return google.gmail({ version: "v1", auth })
}

/**
 * List messages in INBOX not yet labeled AI_PROCESSED, fetch full payload, return EmailData[].
 */
export async function fetchNewEmails(userId: string): Promise<EmailData[]> {
  const gmail = await getGmailClient(userId)

  const labelId = await ensureAiProcessedLabel(gmail)
  const query = labelId
    ? `in:inbox -label:${LABEL_NAME_AI_PROCESSED}`
    : "in:inbox"

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: MAX_MESSAGES,
  })

  console.log("[Gmail] Found messages:", listRes.data.messages?.length ?? 0)

  const messages = listRes.data.messages ?? []
  const results: EmailData[] = []

  for (const m of messages) {
    const id = m.id
    if (!id) continue
    try {
      const full = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      })
      const payload = full.data.payload
      const headers = payload?.headers ?? []
      const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")
      const subjectHeader = headers.find(
        (h) => h.name?.toLowerCase() === "subject"
      )
      const fromHeaderVal = fromHeader?.value ?? ""
      const { email: fromEmail, name: fromName } = parseFromHeader(fromHeaderVal)
      const subject = subjectHeader?.value ?? ""
      const body = extractBody(payload)
      const snippet = full.data.snippet ?? undefined
      const internalDate = full.data.internalDate
      const receivedAt = internalDate
        ? new Date(parseInt(internalDate, 10))
        : new Date(0)

      results.push({
        gmailMessageId: full.data.id!,
        threadId: full.data.threadId ?? undefined,
        from: fromEmail,
        fromName: fromName ?? undefined,
        subject,
        body,
        snippet,
        receivedAt,
      })
    } catch {
      // skip single message errors
    }
  }

  console.log("[Gmail] Returning emails:", results.length)
  return results
}

function parseFromHeader(from: string): { email: string; name?: string } {
  const match = from.match(/^(.+?)\s*<([^>]+)>$/)
  if (match) {
    return {
      name: match[1].replace(/^["']|["']$/g, "").trim(),
      email: match[2].trim(),
    }
  }
  return { email: from.trim() }
}

function extractBody(payload: gmail_v1.Schema$MessagePart | undefined): string {
  if (!payload) return ""

  const parts = payload.parts ?? []
  let textPlain: string | null = null
  let textHtml: string | null = null

  for (const part of parts) {
    const mimeType = (part.mimeType ?? "").toLowerCase()
    const body = part.body?.data
    if (!body) continue
    const decoded = decodeBase64Url(body)
    if (mimeType === "text/plain") textPlain = decoded
    else if (mimeType === "text/html") textHtml = decoded
  }

  if (payload.body?.data) {
    const mimeType = (payload.mimeType ?? "").toLowerCase()
    const decoded = decodeBase64Url(payload.body.data)
    if (mimeType === "text/plain") textPlain = decoded
    else if (mimeType === "text/html") textHtml = decoded
  }

  if (textPlain) return textPlain
  if (textHtml) return textHtml
  return ""
}

function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  return Buffer.from(base64, "base64").toString("utf8")
}

async function ensureAiProcessedLabel(
  gmail: gmail_v1.Gmail
): Promise<string | null> {
  const listRes = await gmail.users.labels.list({ userId: "me" })
  const labels = listRes.data.labels ?? []
  const existing = labels.find(
    (l) =>
      l.name === LABEL_NAME_AI_PROCESSED ||
      l.id === LABEL_NAME_AI_PROCESSED
  )
  if (existing?.id) return existing.id

  try {
    const createRes = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: LABEL_NAME_AI_PROCESSED,
        labelListVisibility: "labelHide",
        messageListVisibility: "hide",
      },
    })
    return createRes.data.id ?? null
  } catch {
    return null
  }
}

/**
 * Add label AI_PROCESSED and remove UNREAD from the message.
 */
export async function markEmailProcessed(
  userId: string,
  gmailMessageId: string
): Promise<void> {
  const gmail = await getGmailClient(userId)

  const labelsRes = await gmail.users.labels.list({ userId: "me" })
  const labels = labelsRes.data.labels ?? []
  let aiProcessedId = labels.find((l) => l.name === LABEL_NAME_AI_PROCESSED)
    ?.id
  if (!aiProcessedId) {
    const createRes = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: LABEL_NAME_AI_PROCESSED,
        labelListVisibility: "labelHide",
        messageListVisibility: "hide",
      },
    })
    aiProcessedId = createRes.data.id ?? undefined
  }
  if (!aiProcessedId) return

  await gmail.users.messages.modify({
    userId: "me",
    id: gmailMessageId,
    requestBody: {
      addLabelIds: [aiProcessedId],
      removeLabelIds: ["UNREAD"],
    },
  })
}

/**
 * Return true if user has a valid Gmail OAuth token.
 */
export async function checkGmailConnected(userId: string): Promise<boolean> {
  const token = await db.oAuthToken.findUnique({
    where: {
      userId_provider: { userId, provider: Provider.GMAIL },
    },
  })
  if (!token || token.tokenInvalid) return false
  return true
}
