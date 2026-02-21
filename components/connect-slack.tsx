"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Bell } from "lucide-react"

export function ConnectSlack() {
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/slack/status")
      .then((res) => res.json())
      .then((data: { connected?: boolean }) =>
        setConnected(Boolean(data?.connected))
      )
      .catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    const slack = searchParams.get("slack")
    if (slack === "connected") {
      toast.success("Slack connected successfully")
      setConnected(true)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (slack === "error") {
      toast.error("Failed to connect Slack. Please try again.")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [searchParams])

  const handleConnect = () => {
    window.location.href = "/api/slack/connect"
  }

  if (connected === null) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span className="text-sm text-muted-foreground">Checking…</span>
      </div>
    )
  }

  if (connected) {
    return (
      <Badge
        variant="secondary"
        className="inline-flex items-center gap-1.5 border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
      >
        <Bell className="size-3.5" />
        Slack Connected ✓
      </Badge>
    )
  }

  return (
    <Button
      type="button"
      onClick={handleConnect}
      className="inline-flex items-center gap-2 bg-teal text-foreground hover:bg-teal/90"
    >
      <Bell className="size-4" />
      Connect Slack
    </Button>
  )
}
