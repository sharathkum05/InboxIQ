import { WebClient } from "@slack/web-api"
import { db } from "@/lib/db"
import { decrypt } from "@/lib/encryption"
import { Provider } from "@prisma/client"

export async function getSlackClient(userId: string): Promise<WebClient> {
  const token = await db.oAuthToken.findUnique({
    where: {
      userId_provider: { userId, provider: Provider.SLACK },
    },
  })
  if (!token || token.tokenInvalid) {
    throw new Error("Slack not connected or token invalid")
  }
  const accessToken = decrypt(token.accessToken)
  return new WebClient(accessToken)
}

export async function checkSlackConnected(userId: string): Promise<boolean> {
  const token = await db.oAuthToken.findUnique({
    where: {
      userId_provider: { userId, provider: Provider.SLACK },
    },
  })
  return !!(token && !token.tokenInvalid)
}

async function getSlackChannel(userId: string): Promise<string> {
  const prefs = await db.userPreference.findUnique({
    where: { userId },
  })
  return prefs?.slackChannel ?? "#general"
}

export async function sendUrgentNotification(
  userId: string,
  email: {
    from: string
    fromName: string | null
    subject: string
    urgencyScore: number
    summary: string
    draftReply: string
    actionItems: string[]
    deadlineDetected: string | null
    gmailMessageId: string
  }
): Promise<void> {
  const client = await getSlackClient(userId)
  const channel = await getSlackChannel(userId)

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 URGENT EMAIL",
        emoji: true,
      },
    },
    { type: "divider" },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*From:*\n${email.fromName || email.from}`,
        },
        {
          type: "mrkdwn",
          text: `*Urgency:*\n${email.urgencyScore}/10`,
        },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Subject:*\n${email.subject}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Summary:*\n${email.summary}`,
      },
    },
  ]

  if (email.actionItems.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Action Items:*\n${email.actionItems.map((item) => `• ${item}`).join("\n")}`,
      },
    })
  }

  if (email.deadlineDetected) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*⏰ Deadline:*\n${new Date(email.deadlineDetected).toLocaleString()}`,
      },
    })
  }

  blocks.push(
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*💬 Draft Reply:*\n${email.draftReply}`,
      },
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "Open in Gmail" },
          url: `https://mail.google.com/mail/u/0/#inbox/${email.gmailMessageId}`,
        },
      ],
    }
  )

  await client.chat.postMessage({
    channel: channel.replace(/^#/, ""),
    text: `Urgent: ${email.subject}`,
    blocks: blocks as Parameters<WebClient["chat"]["postMessage"]>[0]["blocks"],
  })

  await db.email.updateMany({
    where: { userId, gmailMessageId: email.gmailMessageId },
    data: { slackNotificationSent: true, notificationSentAt: new Date() },
  })
}

const PRIORITY_EMOJI: Record<string, string> = {
  URGENT: "🔴",
  HIGH: "🟠",
  MEDIUM: "🟡",
  LOW: "⚪",
}

export async function sendBatchDigest(
  userId: string,
  emails: Array<{
    from: string
    subject: string
    urgencyScore: number
    priorityLevel: string
    gmailMessageId: string
  }>
): Promise<void> {
  if (emails.length === 0) return

  const client = await getSlackClient(userId)
  const channel = await getSlackChannel(userId)

  const sorted = [...emails].sort((a, b) => b.urgencyScore - a.urgencyScore)
  const lines = sorted.map(
    (e) =>
      `${PRIORITY_EMOJI[e.priorityLevel] ?? "⚪"} *${e.urgencyScore.toFixed(1)}* | ${e.from} — ${e.subject}`
  )
  const text = `📬 *Email Digest* — ${emails.length} new emails\n\n${lines.join("\n")}`

  await client.chat.postMessage({
    channel: channel.replace(/^#/, ""),
    text: `Email digest: ${emails.length} new emails`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text },
      },
    ],
  })

  await db.email.updateMany({
    where: {
      userId,
      gmailMessageId: { in: emails.map((e) => e.gmailMessageId) },
    },
    data: { slackNotificationSent: true, notificationSentAt: new Date() },
  })
}
