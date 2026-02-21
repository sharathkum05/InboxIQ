import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { fetchNewEmails, markEmailProcessed } from "@/lib/gmail"
import { classifyEmail, generateDraftReply } from "@/lib/gemini"
import { calculateUrgencyScore } from "@/lib/urgency-calculator"
import {
  checkSlackConnected,
  sendUrgentNotification,
  sendBatchDigest,
} from "@/lib/slack"
import {
  SenderType,
  EmailType,
  PriorityLevel,
  Provider,
} from "@prisma/client"

function checkCronAuth(request: Request): boolean {
  const auth = request.headers.get("Authorization")
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  return auth === `Bearer ${expected}`
}

async function processUserEmails(userId: string): Promise<{
  processed: number
  urgent: number
  batched: number
  error?: string
}> {
  try {
    const newEmails = await fetchNewEmails(userId)
    console.log(`[Cron] User ${userId}: fetched ${newEmails.length} new emails`)

    if (newEmails.length === 0) {
      return { processed: 0, urgent: 0, batched: 0 }
    }

    let urgentCount = 0
    let batchedCount = 0

    const prefs = await db.userPreference.findUnique({
      where: { userId },
    })
    const threshold = prefs?.urgencyThreshold ?? 6.0

    const batchEmails: Array<{
      from: string
      subject: string
      urgencyScore: number
      priorityLevel: PriorityLevel
      gmailMessageId: string
    }> = []

    for (const emailData of newEmails) {
      const existing = await db.email.findUnique({
        where: { gmailMessageId: emailData.gmailMessageId },
      })
      if (existing) continue

      const classification = await classifyEmail({
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
        receivedAt: emailData.receivedAt,
      })

      const isFollowUp = /^(Re:|Fwd:)/i.test(emailData.subject)

      const urgencyScore = calculateUrgencyScore({
        llmBaseScore: classification.urgencyBaseScore,
        subject: emailData.subject,
        body: emailData.body,
        senderType: classification.senderType,
        deadlineDetected: classification.deadlineDetected,
        isFollowUp,
      })

      let draftReply: string | null = null
      if (urgencyScore >= 4) {
        const reply = await generateDraftReply(
          {
            from: emailData.from,
            subject: emailData.subject,
            body: emailData.body,
          },
          classification
        )
        draftReply = reply || null
      }

      const savedEmail = await db.email.create({
        data: {
          userId,
          gmailMessageId: emailData.gmailMessageId,
          from: emailData.from,
          fromName: emailData.fromName ?? null,
          subject: emailData.subject,
          body: emailData.body,
          snippet: emailData.snippet ?? null,
          receivedAt: emailData.receivedAt,
          senderType: classification.senderType as SenderType,
          emailType: classification.emailType as EmailType,
          priorityLevel: classification.priorityLevel as PriorityLevel,
          urgencyScore,
          summary: classification.summary,
          draftReply,
          deadlineDetected: classification.deadlineDetected
            ? new Date(classification.deadlineDetected)
            : null,
          actionItems: classification.actionItems,
          processedAt: new Date(),
        },
      })

      await markEmailProcessed(userId, emailData.gmailMessageId)

      if (urgencyScore >= threshold) {
        try {
          const slackConnected = await checkSlackConnected(userId)
          if (slackConnected) {
            await sendUrgentNotification(userId, {
              from: savedEmail.from,
              fromName: savedEmail.fromName,
              subject: savedEmail.subject,
              urgencyScore: savedEmail.urgencyScore,
              summary: savedEmail.summary ?? "",
              draftReply: savedEmail.draftReply ?? "",
              actionItems: savedEmail.actionItems,
              deadlineDetected: savedEmail.deadlineDetected?.toISOString() ?? null,
              gmailMessageId: savedEmail.gmailMessageId,
            })
          }
          urgentCount++
        } catch (err) {
          console.log("Slack notification skipped:", (err as Error).message)
          urgentCount++
        }
      } else {
        batchEmails.push({
          from: savedEmail.from,
          subject: savedEmail.subject,
          urgencyScore: savedEmail.urgencyScore,
          priorityLevel: savedEmail.priorityLevel,
          gmailMessageId: savedEmail.gmailMessageId,
        })
      }
    }

    if (batchEmails.length > 0) {
      try {
        const slackConnected = await checkSlackConnected(userId)
        if (slackConnected) {
          await sendBatchDigest(userId, batchEmails)
        }
        batchedCount = batchEmails.length
      } catch (err) {
        console.log("Batch digest skipped:", (err as Error).message)
        batchedCount = batchEmails.length
      }
    }

    return {
      processed: newEmails.length,
      urgent: urgentCount,
      batched: batchedCount,
    }
  } catch (error) {
    if ((error as Error).message === "GMAIL_TOKEN_INVALID") {
      console.log(`Skipping user ${userId}: Gmail token invalid`)
      return { processed: 0, urgent: 0, batched: 0, error: "token_invalid" }
    }
    throw error
  }
}

export async function GET(request: Request) {
  if (!checkCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const tokens = await db.oAuthToken.findMany({
    where: { provider: Provider.GMAIL, tokenInvalid: false },
    include: { user: true },
  })

  const results: Array<{
    userId: string
    processed: number
    urgent: number
    batched: number
    error?: string
  }> = []

  for (const token of tokens) {
    const result = await processUserEmails(token.userId)
    results.push({ userId: token.userId, ...result })
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    users: results.length,
    totalProcessed: results.reduce((sum, r) => sum + r.processed, 0),
    totalUrgent: results.reduce((sum, r) => sum + r.urgent, 0),
    totalBatched: results.reduce((sum, r) => sum + r.batched, 0),
    results,
  })
}
