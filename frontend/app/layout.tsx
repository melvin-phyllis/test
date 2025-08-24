import type React from "react"
import type { Metadata } from "next"
import { Geist, Manrope } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "AI Prospecting Platform - Automatisez votre prospection",
  description:
    "Plateforme de prospection intelligente utilisant l'IA pour automatiser et optimiser vos campagnes de prospection commerciale.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${geist.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
