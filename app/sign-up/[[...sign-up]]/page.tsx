"use client"

import { SignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Mail, Brain, Bell, Star, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

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

export default function SignUpPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-teal flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground">InboxIQ</span>
          </Link>

          {/* Clerk SignUp Component */}
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-4xl font-bold text-foreground mb-2",
                headerSubtitle: "text-lg text-muted-foreground",
                socialButtonsBlockButton: "bg-card border-border hover:bg-muted h-12 transition-colors",
                socialButtonsBlockButtonText: "text-foreground font-medium",
                formButtonPrimary: "bg-teal hover:bg-teal/90 text-foreground h-12 shadow-lg shadow-teal/20 font-semibold",
                formFieldInput: "bg-card border-border focus:border-teal focus:ring-teal h-12",
                formFieldLabel: "text-foreground font-medium",
                footerActionLink: "text-teal hover:text-teal/80",
                identityPreviewText: "text-foreground",
                formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                formResendCodeLink: "text-teal hover:text-teal/80",
                otpCodeFieldInput: "border-border",
                formFieldRow: "gap-4",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
              },
            }}
            routing="path"
            path="/sign-up"
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
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
            <div className="text-4xl font-bold text-background mb-2">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-8 h-8 text-teal" />
                Free
              </span>
            </div>
            <div className="text-sm text-background/80">
              during beta period
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
