import { GoogleGenerativeAI } from "@google/generative-ai"

export type EmailClassification = {
  senderType: "PROFESSOR" | "RECRUITER" | "MANAGER" | "PEER" | "OTHER"
  emailType: "TASK" | "SUBMISSION" | "MEETING" | "QUESTION" | "INFO" | "OTHER"
  priorityLevel: "URGENT" | "HIGH" | "MEDIUM" | "LOW"
  summary: string
  actionItems: string[]
  deadlineDetected: string | null
  urgencyBaseScore: number
}

const SENDER_TYPES = ["PROFESSOR", "RECRUITER", "MANAGER", "PEER", "OTHER"] as const
const EMAIL_TYPES = ["TASK", "SUBMISSION", "MEETING", "QUESTION", "INFO", "OTHER"] as const
const PRIORITY_LEVELS = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const

function parseClassification(raw: unknown, fallbackSubject: string): EmailClassification {
  const defaults: EmailClassification = {
    senderType: "OTHER",
    emailType: "INFO",
    priorityLevel: "LOW",
    summary: fallbackSubject,
    actionItems: [],
    deadlineDetected: null,
    urgencyBaseScore: 3,
  }
  if (!raw || typeof raw !== "object") return defaults
  const o = raw as Record<string, unknown>
  const senderType = typeof o.senderType === "string" && SENDER_TYPES.includes(o.senderType as (typeof SENDER_TYPES)[number]) ? o.senderType : defaults.senderType
  const emailType = typeof o.emailType === "string" && EMAIL_TYPES.includes(o.emailType as (typeof EMAIL_TYPES)[number]) ? o.emailType : defaults.emailType
  const priorityLevel = typeof o.priorityLevel === "string" && PRIORITY_LEVELS.includes(o.priorityLevel as (typeof PRIORITY_LEVELS)[number]) ? o.priorityLevel : defaults.priorityLevel
  const summary = typeof o.summary === "string" && o.summary.trim() ? o.summary.trim() : defaults.summary
  const actionItems = Array.isArray(o.actionItems) ? o.actionItems.filter((x): x is string => typeof x === "string") : defaults.actionItems
  const deadlineDetected = typeof o.deadlineDetected === "string" && o.deadlineDetected.trim() && o.deadlineDetected.toLowerCase() !== "null" ? o.deadlineDetected.trim() : null
  let urgencyBaseScore = defaults.urgencyBaseScore
  if (typeof o.urgencyBaseScore === "number" && !Number.isNaN(o.urgencyBaseScore)) {
    urgencyBaseScore = Math.max(0, Math.min(10, o.urgencyBaseScore))
  }
  return {
    senderType: senderType as EmailClassification["senderType"],
    emailType: emailType as EmailClassification["emailType"],
    priorityLevel: priorityLevel as EmailClassification["priorityLevel"],
    summary,
    actionItems,
    deadlineDetected,
    urgencyBaseScore,
  }
}

export async function classifyEmail(email: {
  from: string
  subject: string
  body: string
  receivedAt: Date
}): Promise<EmailClassification> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return parseClassification(null, email.subject)
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { temperature: 0.1 },
    systemInstruction:
      "You are an email classification AI for students and professionals. Analyze emails and extract: sender type, email type, priority, summary, action items, deadlines, and urgency score (0-10).",
  })

  const userPrompt = `Classify this email and respond ONLY with valid JSON matching this schema:
{
  "senderType": "PROFESSOR|RECRUITER|MANAGER|PEER|OTHER",
  "emailType": "TASK|SUBMISSION|MEETING|QUESTION|INFO|OTHER",
  "priorityLevel": "URGENT|HIGH|MEDIUM|LOW",
  "summary": "2-3 sentence summary",
  "actionItems": ["action 1", "action 2"],
  "deadlineDetected": "2026-02-25T23:59:00Z or null",
  "urgencyBaseScore": 7.5
}

Email details:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 3000)}
Received: ${email.receivedAt.toISOString()}`

  try {
    const result = await model.generateContent(userPrompt)
    const response = result.response
    const text = response.text()?.trim() ?? ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : text
    const parsed = JSON.parse(jsonStr) as unknown
    return parseClassification(parsed, email.subject)
  } catch {
    return parseClassification(null, email.subject)
  }
}

export async function generateDraftReply(
  email: { from: string; subject: string; body: string },
  classification: EmailClassification
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return ""

  const tone =
    classification.senderType === "PROFESSOR" || classification.senderType === "MANAGER"
      ? "formal and professional"
      : classification.senderType === "RECRUITER"
        ? "enthusiastic and professional"
        : classification.senderType === "PEER"
          ? "friendly and casual"
          : "professional"

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { temperature: 0.3 },
  })

  const prompt = `You are writing a reply to this email. Use a ${tone} tone.

Original email:
From: ${email.from}
Subject: ${email.subject}
Body: ${email.body.substring(0, 2000)}

Classification: ${classification.summary}. Priority: ${classification.priorityLevel}. Action items: ${classification.actionItems.join("; ") || "none"}.

Write a reply under 150 words. Return ONLY the reply body—no subject line, no "From:", no signature.`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()?.trim() ?? ""
    return text
  } catch {
    return ""
  }
}
