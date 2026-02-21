"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M24 5.457v13.909c0 .857-.695 1.554-1.55 1.554H1.55C.695 21.366 0 20.67 0 19.814V5.457c0-.856.695-1.554 1.55-1.554h.383L12 12.374l10.067-8.463h.383c.856 0 1.55.698 1.55 1.554zM12 10.093L2.567 4.62v12.594h18.866V4.62L12 10.093z" />
    </svg>
  )
}

export function ConnectGmail() {
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/gmail/status")
      .then((res) => res.json())
      .then((data: { connected?: boolean }) =>
        setConnected(Boolean(data?.connected))
      )
      .catch(() => setConnected(false))
  }, [])

  useEffect(() => {
    const gmail = searchParams.get("gmail")
    const message = searchParams.get("message")
    if (gmail === "connected") {
      toast.success("Gmail connected successfully")
      setConnected(true)
      window.history.replaceState({}, "", window.location.pathname)
    } else if (gmail === "error") {
      let errorMessage = "Failed to connect Gmail. Please try again."
      if (message) {
        try {
          errorMessage = decodeURIComponent(message)
        } catch {
          errorMessage = message
        }
      }
      toast.error(errorMessage)
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [searchParams])

  const handleConnect = () => {
    window.location.href = "/api/gmail/connect"
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
        <GmailIcon className="size-3.5" />
        Gmail Connected ✓
      </Badge>
    )
  }

  return (
    <Button
      type="button"
      onClick={handleConnect}
      className="inline-flex items-center gap-2 bg-teal text-foreground hover:bg-teal/90"
    >
      <GmailIcon className="size-4" />
      Connect Gmail
    </Button>
  )
}
