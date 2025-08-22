import type React from "react"
import type { Metadata } from "next"
import { Work_Sans, Open_Sans } from "next/font/google"
import { I18nProvider } from "@/lib/i18n"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Global AI Prospecting Platform | Scale International Business Development",
  description:
    "Scale international prospecting with AI agents, in real time. Discover prospects across 195+ countries with intelligent automation and cultural adaptation.",
  keywords: [
    "AI prospecting",
    "international business",
    "lead generation",
    "global expansion",
    "B2B automation",
    "sales intelligence",
  ],
  authors: [{ name: "Global AI Prospecting Platform" }],
  creator: "Global AI Prospecting Platform",
  publisher: "Global AI Prospecting Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://globalai-prospecting.vercel.app"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
      "fr-FR": "/fr-FR",
    },
  },
  openGraph: {
    title: "Global AI Prospecting Platform",
    description: "Scale international prospecting with AI agents, in real time.",
    url: "https://globalai-prospecting.vercel.app",
    siteName: "Global AI Prospecting Platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Global AI Prospecting Platform - Scale international business development",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global AI Prospecting Platform",
    description: "Scale international prospecting with AI agents, in real time.",
    images: ["/og-image.png"],
    creator: "@globalaiprospect",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <style>{`
html {
  font-family: ${openSans.style.fontFamily};
  --font-sans: ${openSans.variable};
  --font-heading: ${workSans.variable};
}
        `}</style>
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
