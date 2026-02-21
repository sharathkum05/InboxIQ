/**
 * Combines LLM base score, keyword detection, sender type, deadline proximity,
 * and follow-up flag into a single urgency score 0–10.
 */
export function calculateUrgencyScore(params: {
  llmBaseScore: number
  subject: string
  body: string
  senderType: string
  deadlineDetected: string | null
  isFollowUp: boolean
}): number {
  const { llmBaseScore, subject, body, senderType, deadlineDetected, isFollowUp } = params

  // 1. LLM Score (40%)
  const llmComponent = Math.max(0, Math.min(10, llmBaseScore)) * 0.4

  // 2. Keyword Score (20%) – highest matching tier
  const text = `${subject} ${body}`.toLowerCase()
  let keywordPoints = 0
  if (/\b(urgent|asap|immediately|critical)\b/.test(text)) keywordPoints = Math.max(keywordPoints, 8)
  if (/\b(deadline|due today|due tomorrow|eod|end of day)\b/.test(text)) keywordPoints = Math.max(keywordPoints, 7)
  if (/\b(this week|soon|follow up|reminder)\b/.test(text)) keywordPoints = Math.max(keywordPoints, 5)
  if (/\b(when you can|no rush)\b/.test(text)) keywordPoints = Math.max(keywordPoints, 2)
  const keywordComponent = keywordPoints * 0.2

  // 3. Sender Weight (20%)
  const senderPoints: Record<string, number> = {
    PROFESSOR: 8,
    MANAGER: 8,
    RECRUITER: 7,
    PEER: 3,
    OTHER: 5,
  }
  const senderPointsValue = senderPoints[senderType] ?? 5
  const senderComponent = senderPointsValue * 0.2

  // 4. Deadline Proximity (15%)
  let deadlinePoints = 0
  if (deadlineDetected) {
    const deadline = new Date(deadlineDetected).getTime()
    const now = Date.now()
    if (deadline <= now) {
      deadlinePoints = 10
    } else {
      const hoursUntil = (deadline - now) / (1000 * 60 * 60)
      if (hoursUntil < 6) deadlinePoints = 10
      else if (hoursUntil < 24) deadlinePoints = 9
      else if (hoursUntil < 48) deadlinePoints = 7
      else if (hoursUntil < 72) deadlinePoints = 5
      else if (hoursUntil < 24 * 7) deadlinePoints = 3
      else deadlinePoints = 1
    }
  }
  const deadlineComponent = deadlinePoints * 0.15

  // 5. Follow-up Bonus (5%)
  const followUpComponent = isFollowUp ? 2 * 0.05 : 0

  const raw = llmComponent + keywordComponent + senderComponent + deadlineComponent + followUpComponent
  const clamped = Math.max(0, Math.min(10, raw))
  return Math.round(clamped * 10) / 10
}
