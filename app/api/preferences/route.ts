import { auth, currentUser } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"

const preferencesSchema = z.object({
  urgencyThreshold: z.number().min(0).max(10),
  digestFrequencyMinutes: z.union([z.literal(15), z.literal(30), z.literal(60)]),
  quietHoursStart: z.string().nullable(),
  quietHoursEnd: z.string().nullable(),
  slackChannel: z.string(),
  customUrgentKeywords: z.array(z.string()),
  enableBatchDigest: z.boolean(),
})

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const prefs = await db.userPreference.findUnique({
    where: { userId },
  })

  if (prefs) {
    return NextResponse.json({
      urgencyThreshold: prefs.urgencyThreshold,
      digestFrequencyMinutes: prefs.digestFrequencyMinutes,
      quietHoursStart: prefs.quietHoursStart,
      quietHoursEnd: prefs.quietHoursEnd,
      slackChannel: prefs.slackChannel,
      customUrgentKeywords: prefs.customUrgentKeywords,
      enableBatchDigest: prefs.enableBatchDigest,
    })
  }

  return NextResponse.json({
    urgencyThreshold: 6.0,
    digestFrequencyMinutes: 30,
    quietHoursStart: null,
    quietHoursEnd: null,
    slackChannel: "#general",
    customUrgentKeywords: ["urgent", "asap", "deadline", "critical"],
    enableBatchDigest: true,
  })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  const user = await currentUser()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = preferencesSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data

  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: user?.emailAddresses?.[0]?.emailAddress ?? "",
      name: user?.firstName || user?.lastName
        ? [user.firstName, user.lastName].filter(Boolean).join(" ")
        : null,
    },
    update: {},
  })

  const prefs = await db.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      urgencyThreshold: data.urgencyThreshold,
      digestFrequencyMinutes: data.digestFrequencyMinutes,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
      slackChannel: data.slackChannel,
      customUrgentKeywords: data.customUrgentKeywords,
      enableBatchDigest: data.enableBatchDigest,
    },
    update: {
      urgencyThreshold: data.urgencyThreshold,
      digestFrequencyMinutes: data.digestFrequencyMinutes,
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
      slackChannel: data.slackChannel,
      customUrgentKeywords: data.customUrgentKeywords,
      enableBatchDigest: data.enableBatchDigest,
    },
  })

  return NextResponse.json({
    urgencyThreshold: prefs.urgencyThreshold,
    digestFrequencyMinutes: prefs.digestFrequencyMinutes,
    quietHoursStart: prefs.quietHoursStart,
    quietHoursEnd: prefs.quietHoursEnd,
    slackChannel: prefs.slackChannel,
    customUrgentKeywords: prefs.customUrgentKeywords,
    enableBatchDigest: prefs.enableBatchDigest,
  })
}
