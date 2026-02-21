"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConnectGmail } from "@/components/connect-gmail"
import { EmailCard, type EmailCardEmail } from "@/components/email-card"
import { Mail, AlertTriangle, BarChart3, Bell, RefreshCw } from "lucide-react"
import Link from "next/link"

type Stats = {
  totalToday: number
  urgentCount: number
  avgUrgency: number
  notificationsSent: number
}

type EmailsResponse = {
  emails: EmailCardEmail[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Fetch failed")
  return res.json() as Promise<T>
}

export function DashboardContent() {
  const queryClient = useQueryClient()

  const gmailStatus = useQuery({
    queryKey: ["gmail-status"],
    queryFn: () => fetchJson<{ connected?: boolean }>("/api/gmail/status"),
  })

  const statsQuery = useQuery({
    queryKey: ["emails-stats"],
    queryFn: () => fetchJson<Stats>("/api/emails/stats"),
    enabled: gmailStatus.data?.connected === true,
  })

  const emailsQuery = useQuery({
    queryKey: ["emails", "list", 10],
    queryFn: () =>
      fetchJson<EmailsResponse>("/api/emails?limit=10"),
    enabled: gmailStatus.data?.connected === true,
  })

  const gmailConnected = gmailStatus.data?.connected === true
  const isLoading =
    gmailStatus.isLoading ||
    (gmailConnected && (statsQuery.isLoading || emailsQuery.isLoading))

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["gmail-status"] })
    void queryClient.invalidateQueries({ queryKey: ["emails-stats"] })
    void queryClient.invalidateQueries({ queryKey: ["emails"] })
  }

  if (!gmailConnected && !gmailStatus.isLoading) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Connect Gmail</CardTitle>
          <p className="text-sm text-muted-foreground">
            Connect your Gmail to start processing emails and see your dashboard.
          </p>
        </CardHeader>
        <CardContent>
          <ConnectGmail />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading…
      </div>
    )
  }

  const stats = statsQuery.data
  const emails = emailsQuery.data?.emails ?? []
  const sortedEmails = [...emails].sort(
    (a, b) => (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0)
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total emails (today)
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.totalToday ?? 0}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent emails</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats?.urgentCount ?? 0}</span>
            <p className="text-xs text-muted-foreground">Score ≥ 8</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg urgency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {stats?.avgUrgency != null ? stats.avgUrgency.toFixed(1) : "—"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications sent</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {stats?.notificationsSent ?? 0}
            </span>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent emails</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/emails">View all</Link>
          </Button>
        </div>

        {sortedEmails.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No emails processed yet. The cron runs every 5 minutes.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sortedEmails.map((email) => (
              <EmailCard key={email.id} email={email} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
