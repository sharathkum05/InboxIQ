import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [totalToday, urgentCount, avgResult, notificationsSent] = await Promise.all([
    db.email.count({
      where: {
        userId,
        dismissed: false,
        receivedAt: { gte: startOfToday },
      },
    }),
    db.email.count({
      where: {
        userId,
        dismissed: false,
        urgencyScore: { gte: 8 },
      },
    }),
    db.email.aggregate({
      where: { userId, dismissed: false },
      _avg: { urgencyScore: true },
      _count: { id: true },
    }),
    db.email.count({
      where: {
        userId,
        dismissed: false,
        slackNotificationSent: true,
      },
    }),
  ])

  const avgUrgency =
    avgResult._count.id > 0 && avgResult._avg.urgencyScore != null
      ? Math.round(avgResult._avg.urgencyScore * 10) / 10
      : 0

  return NextResponse.json({
    totalToday,
    urgentCount,
    avgUrgency,
    notificationsSent,
  })
}
