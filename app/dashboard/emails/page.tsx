"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmailCard, type EmailCardEmail } from "@/components/email-card"
import { Search, Mail, ChevronLeft, ChevronRight } from "lucide-react"

const PRIORITIES = [
  { value: "", label: "All" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const

const PAGE_SIZE = 20

type EmailsResponse = {
  emails: EmailCardEmail[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

async function fetchEmails(
  page: number,
  priority: string,
  search: string
): Promise<EmailsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  })
  if (priority) params.set("priority", priority)
  if (search.trim()) params.set("search", search.trim())
  const res = await fetch(`/api/emails?${params.toString()}`)
  if (!res.ok) throw new Error("Fetch failed")
  return res.json() as Promise<EmailsResponse>
}

export default function EmailsPage() {
  const [page, setPage] = useState(1)
  const [priority, setPriority] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const query = useQuery({
    queryKey: ["emails", "list", page, priority, searchTerm],
    queryFn: () => fetchEmails(page, priority, searchTerm),
  })

  const { data, isLoading, isFetching } = query
  const emails = data?.emails ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasMore = data?.hasMore ?? false

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-foreground">
              InboxIQ
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/emails"
                className="text-sm font-medium text-foreground"
              >
                Emails
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 lg:px-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">All emails</h1>
        </div>

        <div className="mb-6 flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject or sender…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <Button
                key={p.value || "all"}
                variant={priority === p.value ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPriority(p.value)
                  setPage(1)
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-5 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mt-4 h-8 w-20 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                No emails match your filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchInput("")
                  setSearchTerm("")
                  setPriority("")
                  setPage(1)
                }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {emails.map((email) => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
