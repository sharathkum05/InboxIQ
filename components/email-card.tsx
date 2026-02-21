"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { UrgencyBadge } from "@/components/urgency-badge"
import { cn } from "@/lib/utils"
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, MessageSquare } from "lucide-react"
import { toast } from "sonner"

export type EmailCardEmail = {
  id: string
  gmailMessageId: string
  from: string
  fromName: string | null
  subject: string
  body: string
  snippet: string | null
  summary: string | null
  draftReply: string | null
  urgencyScore: number
  priorityLevel: string
  actionItems: string[]
  deadlineDetected: string | null
  receivedAt: string
}

const SUMMARY_PREVIEW_LEN = 200

export function EmailCard({ email }: { email: EmailCardEmail }) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [draftOpen, setDraftOpen] = useState(false)

  const summary = email.summary || email.snippet || ""
  const showSummaryToggle = summary.length > SUMMARY_PREVIEW_LEN
  const summaryPreview = summary.slice(0, SUMMARY_PREVIEW_LEN)
  const summaryRest = summary.slice(SUMMARY_PREVIEW_LEN)

  const actionItems = email.actionItems || []
  const visibleActions = actionItems.slice(0, 3)
  const moreCount = actionItems.length - 3

  const deadline = email.deadlineDetected
    ? new Date(email.deadlineDetected)
    : null
  const now = Date.now()
  const deadlineHours = deadline
    ? (deadline.getTime() - now) / (1000 * 60 * 60)
    : null
  const deadlineVariant =
    deadlineHours != null
      ? deadlineHours < 0
        ? "past"
        : deadlineHours < 24
          ? "red"
          : deadlineHours < 48
            ? "yellow"
            : "gray"
      : null

  const copyDraft = () => {
    if (email.draftReply) {
      void navigator.clipboard.writeText(email.draftReply)
      toast.success("Draft copied to clipboard")
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <UrgencyBadge
              urgencyScore={email.urgencyScore}
              priorityLevel={email.priorityLevel}
            />
            <span className="text-sm text-muted-foreground">
              {email.fromName || email.from}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(email.receivedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-tight">
          {email.subject}
        </h3>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {summary && (
          <div className="text-sm text-muted-foreground">
            {showSummaryToggle ? (
              <>
                <span>{summaryOpen ? summary : `${summaryPreview}…`}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs text-primary"
                  onClick={() => setSummaryOpen((o) => !o)}
                >
                  {summaryOpen ? (
                    <>Show less <ChevronUp className="ml-0.5 size-3" /></>
                  ) : (
                    <>Read more <ChevronDown className="ml-0.5 size-3" /></>
                  )}
                </Button>
              </>
            ) : (
              summary
            )}
          </div>
        )}

        {actionItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleActions.map((item, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="inline-flex items-center gap-1 font-normal"
              >
                <Check className="size-3" />
                {item}
              </Badge>
            ))}
            {moreCount > 0 && (
              <Badge variant="outline" className="font-normal">
                +{moreCount} more
              </Badge>
            )}
          </div>
        )}

        {deadline && (
          <div
            className={cn(
              "inline-flex rounded-md px-2 py-1 text-xs font-medium",
              deadlineVariant === "red" &&
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
              deadlineVariant === "yellow" &&
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
              (deadlineVariant === "gray" || deadlineVariant === "past") &&
                "bg-muted text-muted-foreground"
            )}
          >
            ⏰ {deadline.toLocaleString()}
          </div>
        )}

        {email.draftReply && (
          <Collapsible open={draftOpen} onOpenChange={setDraftOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
              >
                <MessageSquare className="size-4" />
                {draftOpen ? "Hide draft reply" : "💬 View Draft Reply"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 rounded-md border bg-muted/50 p-3 text-sm">
                <pre className="whitespace-pre-wrap font-sans">
                  {email.draftReply}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 gap-1"
                  onClick={copyDraft}
                >
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3">
        <a
          href={`https://mail.google.com/mail/u/0/#inbox/${email.gmailMessageId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="size-4" />
            Open in Gmail
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}
