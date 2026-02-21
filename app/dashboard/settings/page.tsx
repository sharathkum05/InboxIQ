"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

type Preferences = {
  urgencyThreshold: number
  digestFrequencyMinutes: number
  quietHoursStart: string | null
  quietHoursEnd: string | null
  slackChannel: string
  customUrgentKeywords: string[]
  enableBatchDigest: boolean
}

const DEFAULT_PREFS: Preferences = {
  urgencyThreshold: 6.0,
  digestFrequencyMinutes: 30,
  quietHoursStart: null,
  quietHoursEnd: null,
  slackChannel: "#general",
  customUrgentKeywords: ["urgent", "asap", "deadline", "critical"],
  enableBatchDigest: true,
}

async function fetchPreferences(): Promise<Preferences> {
  const res = await fetch("/api/preferences")
  if (!res.ok) throw new Error("Failed to fetch")
  return res.json() as Promise<Preferences>
}

async function fetchSlackStatus(): Promise<{ connected?: boolean }> {
  const res = await fetch("/api/slack/status")
  if (!res.ok) return { connected: false }
  return res.json() as Promise<{ connected?: boolean }>
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Preferences>(DEFAULT_PREFS)
  const [keywordInput, setKeywordInput] = useState("")

  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  })

  const { data: slackStatus } = useQuery({
    queryKey: ["slack-status"],
    queryFn: fetchSlackStatus,
  })

  useEffect(() => {
    if (prefs) setForm(prefs)
  }, [prefs])

  const saveMutation = useMutation({
    mutationFn: async (data: Preferences) => {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "Save failed")
      }
      return res.json() as Promise<Preferences>
    },
    onSuccess: () => {
      toast.success("Preferences saved")
      void queryClient.invalidateQueries({ queryKey: ["preferences"] })
    },
    onError: (e: Error) => {
      toast.error(e.message)
    },
  })

  const slackConnected = slackStatus?.connected === true

  const addKeyword = () => {
    const k = keywordInput.trim()
    if (k && !form.customUrgentKeywords.includes(k)) {
      setForm((f) => ({
        ...f,
        customUrgentKeywords: [...f.customUrgentKeywords, k],
      }))
      setKeywordInput("")
    }
  }

  const removeKeyword = (word: string) => {
    setForm((f) => ({
      ...f,
      customUrgentKeywords: f.customUrgentKeywords.filter((x) => x !== word),
    }))
  }

  if (prefsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-foreground">
              InboxIQ
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/dashboard/emails" className="text-sm text-muted-foreground hover:text-foreground">
                Emails
              </Link>
              <Link href="/dashboard/settings" className="text-sm font-medium text-foreground">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-6 py-8 lg:px-12">
        <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault()
            saveMutation.mutate(form)
          }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Urgency threshold</CardTitle>
              <CardDescription>
                Send immediate alerts for emails scoring at or above this value (0–10).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[form.urgencyThreshold]}
                  onValueChange={([v]) =>
                    setForm((f) => ({ ...f, urgencyThreshold: v ?? 6 }))
                  }
                />
                <span className="w-12 text-sm font-medium">{form.urgencyThreshold.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digest frequency</CardTitle>
              <CardDescription>How often to send batch email digests to Slack.</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={String(form.digestFrequencyMinutes)}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    digestFrequencyMinutes: Number(v) as 15 | 30 | 60,
                  }))
                }
                className="flex flex-col gap-2"
              >
                {[15, 30, 60].map((m) => (
                  <div key={m} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(m)} id={`digest-${m}`} />
                    <Label htmlFor={`digest-${m}`}>
                      Every {m} minutes{m === 30 ? " (default)" : ""}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiet hours</CardTitle>
              <CardDescription>
                During quiet hours, only send critical alerts (9.0+). Optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start (HH:MM)</Label>
                <Input
                  id="quiet-start"
                  placeholder="22:00"
                  value={form.quietHoursStart ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quietHoursStart: e.target.value.trim() || null,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End (HH:MM)</Label>
                <Input
                  id="quiet-end"
                  placeholder="08:00"
                  value={form.quietHoursEnd ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quietHoursEnd: e.target.value.trim() || null,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {slackConnected && (
            <Card>
              <CardHeader>
                <CardTitle>Slack channel</CardTitle>
                <CardDescription>Channel for notifications (e.g. #general).</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={form.slackChannel}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slackChannel: e.target.value }))
                  }
                  placeholder="#general"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Custom urgent keywords</CardTitle>
              <CardDescription>
                Add these keywords to urgency detection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" variant="outline" onClick={addKeyword}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.customUrgentKeywords.map((k) => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-sm"
                  >
                    {k}
                    <button
                      type="button"
                      className="ml-1 rounded hover:bg-muted-foreground/20"
                      onClick={() => removeKeyword(k)}
                      aria-label={`Remove ${k}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Batch digest</CardTitle>
              <CardDescription>Send a batch digest of non-urgent emails to Slack.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="batch-digest"
                  checked={form.enableBatchDigest}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, enableBatchDigest: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="batch-digest">Enable batch digest</Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save preferences"}
          </Button>
        </form>
      </main>
    </div>
  )
}
