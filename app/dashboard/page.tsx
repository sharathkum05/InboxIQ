import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { Suspense } from "react"
import { ConnectGmail } from "@/components/connect-gmail"
import { ConnectSlack } from "@/components/connect-slack"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-foreground"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">InboxIQ</span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-sm font-medium text-foreground hover:text-muted-foreground"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/emails"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Emails
            </a>
            <a
              href="/dashboard/settings"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Settings
            </a>
            <Suspense fallback={null}>
              <ConnectGmail />
            </Suspense>
            <Suspense fallback={null}>
              <ConnectSlack />
            </Suspense>
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 lg:px-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground md:text-5xl">
            Welcome back, {user.firstName || "there"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Your intelligent email dashboard.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading dashboard…
            </div>
          }
        >
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  )
}
