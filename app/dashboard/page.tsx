import { currentUser } from "@clerk/nextjs/server"
import { UserButton } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Mail, Brain, Bell, TrendingUp, Clock, CheckCircle } from "lucide-react"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-foreground" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-foreground">InboxIQ</span>
          </div>

          {/* User Button */}
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-12 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome back, {user.firstName || "there"}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Your intelligent email dashboard is almost ready.
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal/10 to-cyan-400/10 border-2 border-teal/30 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-teal mx-auto mb-6 flex items-center justify-center">
              <Brain className="w-10 h-10 text-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Dashboard Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're building something amazing for you. Soon you'll be able to see your categorized emails, 
              urgent notifications, and AI-powered insights all in one place.
            </p>

            {/* Feature Preview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-teal" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Email Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Track categorized emails and response times
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-6 h-6 text-coral" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Urgent Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  View priority messages that need attention
                </p>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Get smart recommendations and patterns
                </p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="mt-8 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Your Account is Active</h3>
                <p className="text-muted-foreground mb-4">
                  You're all set for beta access! We'll notify you via email when new features are ready. 
                  In the meantime, explore our documentation to learn how to connect your Gmail and Slack.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal text-foreground text-sm font-medium hover:bg-teal/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Connect Gmail
                  </a>
                  <a 
                    href="#" 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
                  >
                    <Bell className="w-4 h-4" />
                    Connect Slack
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
