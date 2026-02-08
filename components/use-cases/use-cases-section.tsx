"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { GraduationCap, Briefcase, TrendingUp } from "lucide-react"

const useCases = [
  {
    icon: GraduationCap,
    title: "Students",
    description: "Never miss professor emails or deadlines",
    benefits: ["Assignment reminders", "Office hour alerts", "Grade notifications"],
    color: "teal"
  },
  {
    icon: Briefcase,
    title: "Job Seekers",
    description: "Catch every recruiter message instantly",
    benefits: ["Interview invites", "Application updates", "Networking replies"],
    color: "coral"
  },
  {
    icon: TrendingUp,
    title: "Professionals",
    description: "Prioritize what matters, ignore the noise",
    benefits: ["VIP client emails", "Urgent requests", "Meeting changes"],
    color: "gold"
  },
]

const colorClasses = {
  teal: {
    bg: "bg-teal/10",
    text: "text-teal",
    border: "border-teal/20",
    glow: "shadow-teal/5",
    checkmark: "text-teal"
  },
  coral: {
    bg: "bg-coral/10",
    text: "text-coral",
    border: "border-coral/20",
    glow: "shadow-coral/5",
    checkmark: "text-coral"
  },
  gold: {
    bg: "bg-gold/10",
    text: "text-gold",
    border: "border-gold/20",
    glow: "shadow-gold/5",
    checkmark: "text-gold"
  },
}

export function UseCasesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-gold/5" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            Use Cases
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance" suppressHydrationWarning>
            Perfect for{" "}
            <span className="text-teal">everyone</span>
          </h2>
        </motion.div>

        {/* Use case cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase, index) => {
            const colors = colorClasses[useCase.color as keyof typeof colorClasses]
            
            return (
              <motion.div
                key={useCase.title}
                initial={false}
                animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-${useCase.color}/30 ${colors.glow}`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center mb-6`}>
                  <useCase.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-foreground mb-2" suppressHydrationWarning>
                  {useCase.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed" suppressHydrationWarning>
                  {useCase.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {useCase.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <svg
                        className={`w-5 h-5 ${colors.checkmark} flex-shrink-0 mt-0.5`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl ${colors.bg} opacity-0 hover:opacity-30 transition-opacity duration-300 -z-10 blur-xl`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
