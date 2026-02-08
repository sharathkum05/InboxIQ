"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Lock, Github, Star, Sparkles, Brain, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

// 3D Illustration Component
function IllustrationScene() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Gmail Icon */}
      <motion.div
        className="absolute"
        style={{ left: "20%", top: "30%" }}
        animate={{
          y: [0, -20, 0],
          rotateY: [0, 10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal/20 to-cyan-400/20 backdrop-blur-sm border border-teal/30 flex items-center justify-center shadow-2xl">
          <Mail className="w-12 h-12 text-teal" />
        </div>
      </motion.div>

      {/* AI Brain Element */}
      <motion.div
        className="absolute"
        style={{ left: "50%", top: "40%", transform: "translateX(-50%)" }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-teal to-cyan-400 flex items-center justify-center shadow-2xl shadow-teal/50">
            <Brain className="w-16 h-16 text-foreground" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gold flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-foreground" />
          </motion.div>
        </div>
      </motion.div>

      {/* Slack Notification Icon */}
      <motion.div
        className="absolute"
        style={{ right: "20%", top: "35%" }}
        animate={{
          y: [0, 20, 0],
          rotateY: [0, -10, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-coral/20 to-gold/20 backdrop-blur-sm border border-coral/30 flex items-center justify-center shadow-2xl">
          <Bell className="w-12 h-12 text-coral" />
        </div>
      </motion.div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.path
          d="M 20% 40% Q 35% 30%, 50% 45%"
          stroke="url(#gradient1)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 50% 45% Q 65% 30%, 80% 40%"
          stroke="url(#gradient2)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174 62% 56%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(174 62% 56%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(174 62% 56%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(174 62% 56%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(174 62% 56%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(174 62% 56%)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in:", { email, password, rememberMe })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-teal flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">InboxIQ</span>
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground">
              Sign in to your InboxIQ account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border focus:border-teal focus:ring-teal"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border focus:border-teal focus:ring-teal"
                  required
                />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-border data-[state=checked]:bg-teal data-[state=checked]:border-teal"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-teal hover:text-teal/80 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-teal text-foreground hover:bg-teal/90 text-base font-semibold shadow-lg shadow-teal/20"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">or</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border hover:bg-muted transition-colors"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border hover:bg-muted transition-colors"
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-teal hover:text-teal/80 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-foreground relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 30%, hsl(174 62% 56% / 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 70%, hsl(188 78% 61% / 0.3) 0%, transparent 50%)
            `,
          }}
        />

        {/* Dotted Background */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* 3D Illustration */}
        <IllustrationScene />

        {/* Floating Stat Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute top-20 right-12 bg-background/10 backdrop-blur-md border border-background/20 rounded-2xl p-6 shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="text-4xl font-bold text-background mb-2">500+</div>
            <div className="text-sm text-background/80">
              professionals trust InboxIQ
            </div>
          </motion.div>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute bottom-20 left-12 bg-background/10 backdrop-blur-md border border-background/20 rounded-2xl p-6 max-w-xs shadow-2xl"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-gold text-gold" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-background text-sm mb-4 leading-relaxed">
              "Never missed a deadline since using InboxIQ"
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal flex items-center justify-center text-foreground text-sm font-medium">
                SC
              </div>
              <div>
                <div className="text-background text-sm font-semibold">Sarah Chen</div>
                <div className="text-background/70 text-xs">MIT Student</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
