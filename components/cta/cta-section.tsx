"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-foreground p-12 lg:p-20 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Headline */}
            <motion.h2
              initial={false}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6 text-balance"
              suppressHydrationWarning
            >
              Ready to take control of{" "}
              <span className="text-teal">your inbox</span>?
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={false}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-background/70 mb-10 leading-relaxed"
              suppressHydrationWarning
            >
              Join the waitlist for free beta access. Be among the first to experience 
              AI-powered email intelligence.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={false}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="bg-teal text-foreground hover:bg-teal/90 group px-8"
                >
                  Join Waitlist
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-background/30 text-background hover:bg-background/10 bg-transparent"
              >
                View Demo
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={false}
              animate={mounted && isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-background/50 text-sm"
            >
              <span>100% free during beta</span>
              <span className="hidden sm:inline">•</span>
              <span>No credit card required</span>
              <span className="hidden sm:inline">•</span>
              <span>Cancel anytime</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
