import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'

import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-sans'
})
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'InboxIQ | AI-Powered Email Management for Gmail & Slack',
  description: 'Never miss important emails again. InboxIQ uses AI to automatically categorize your Gmail, detect urgent messages from professors and recruiters, and send intelligent Slack notifications with draft replies. Free during beta.',
  generator: 'v0.app',
  keywords: ['email management', 'AI email assistant', 'Gmail automation', 'Slack integration', 'email categorization', 'urgent email detection', 'AI draft replies'],
  openGraph: {
    title: 'InboxIQ | AI Email Intelligence',
    description: 'Never miss important emails. AI-powered categorization, urgency detection, and Slack notifications for Gmail.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InboxIQ | AI Email Intelligence',
    description: 'Never miss important emails. AI-powered categorization, urgency detection, and Slack notifications for Gmail.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
