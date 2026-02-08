"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Link2, Brain, Bell } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: Link2,
    title: "Connect Gmail & Slack",
    description: "Securely link your Gmail and Slack in under 2 minutes with OAuth"
  },
  {
    number: 2,
    icon: Brain,
    title: "AI Analyzes Priority",
    description: "Gemini AI learns your patterns and identifies urgent messages"
  },
  {
    number: 3,
    icon: Bell,
    title: "Get Smart Alerts",
    description: "Receive instant Slack notifications with AI-generated draft replies"
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-cyan-400/5" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance" suppressHydrationWarning>
            Setup in minutes,{" "}
            <span className="text-teal">save hours daily</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto relative">
          {/* Connecting lines */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-teal/20 via-teal/50 to-teal/20" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={false}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="relative bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:border-teal/30">
                {/* Step number badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-teal text-foreground flex items-center justify-center text-sm font-bold shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3" suppressHydrationWarning>
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" suppressHydrationWarning>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
