"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote: "InboxIQ saved my GPA! I never miss assignment emails from professors anymore. The AI draft replies are a lifesaver.",
    author: "Sarah Chen",
    role: "CS Student at MIT",
    avatar: "SC",
    color: "bg-teal",
  },
  {
    quote: "Got 3 interview invites that were stuck in my spam. InboxIQ caught them all and sent me instant Slack alerts.",
    author: "Marcus Rodriguez",
    role: "Software Engineer",
    avatar: "MR",
    color: "bg-coral",
  },
  {
    quote: "Finally, an email tool that actually understands what's urgent. The 30-min digests keep me sane without missing anything critical.",
    author: "Emily Watson",
    role: "Product Manager",
    avatar: "EW",
    color: "bg-gold",
  },
]

const logos = [
  "UC Berkeley", "Stanford", "MIT", "Google", "Amazon", "Microsoft"
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal/5 via-transparent to-coral/5" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section header */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance" suppressHydrationWarning>
            Loved by{" "}
            <span className="text-teal">students & professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed" suppressHydrationWarning>
            See what users are saying about staying on top of their inbox with InboxIQ
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={false}
              animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 relative"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground leading-relaxed mb-6" suppressHydrationWarning>
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-foreground text-sm font-medium`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Logo cloud */}
        <motion.div
          initial={false}
          animate={mounted && isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-8" suppressHydrationWarning>
            Trusted by students and professionals at top universities and companies
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16">
            {logos.map((logo, index) => (
              <motion.div
                key={logo}
                initial={false}
                animate={mounted && isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="text-xl font-bold text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
              >
                {logo}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
