"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const features = [
  "Unlimited email categorization",
  "AI-powered urgency detection",
  "Slack integration & notifications",
  "AI-generated draft replies",
  "Deadline tracking & reminders",
  "30-minute digests",
  "Custom rules & filters",
  "Priority support"
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Angled divider top */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-background transform -skew-y-2 origin-top-left -translate-y-12" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance" suppressHydrationWarning>
            Simple, transparent{" "}
            <span className="text-teal">pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed" suppressHydrationWarning>
            Get full access during beta. Lock in early adopter pricing forever.
          </p>
        </motion.div>

        {/* Pricing card */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="relative bg-card border-2 border-teal/30 rounded-3xl p-8 md:p-10 shadow-2xl shadow-teal/10">
            {/* Price */}
            <div className="text-center mb-8 mt-4">
              <div className="mb-2">
                <span className="text-5xl md:text-6xl font-bold text-foreground">Free</span>
              </div>
              <p className="text-muted-foreground">
                During beta period
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                <span className="text-sm font-medium">$5/month after launch</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={false}
                  animate={mounted && isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-teal" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link href="/sign-up" className="w-full block">
              <Button 
                size="lg" 
                className="w-full bg-teal text-foreground hover:bg-teal/90 text-lg py-6"
              >
                Join Waitlist
              </Button>
            </Link>

            {/* Fine print */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              No credit card required • Cancel anytime • Early adopter discount
            </p>
          </div>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Trusted by 500+ beta users
          </p>
          <div className="flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className="w-5 h-5 fill-gold text-gold"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm font-medium text-foreground ml-2">4.9/5</span>
          </div>
        </motion.div>
      </div>

      {/* Angled divider bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-background transform skew-y-2 origin-bottom-right translate-y-12" />
    </section>
  )
}
