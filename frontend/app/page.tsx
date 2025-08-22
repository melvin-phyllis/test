"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Globe, Target, Shield, ArrowRight, Play, Users, TrendingUp, MapPin, Zap, Star } from "lucide-react"
import Link from "next/link"
import { AnimatedCounter } from "@/components/animated-counter"
import { WorldMapBackground } from "@/components/world-map-background"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"

export default function LandingPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-foreground font-[var(--font-heading)]">{t.landing.title}</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                {t.landing.features.title}
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                {t.landing.howItWorks.title}
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <Button asChild>
                <Link href="/app">{t.landing.hero.launchApp}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <WorldMapBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-background"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 font-[var(--font-heading)]">
              {t.landing.hero.headline}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{t.landing.hero.subheadline}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" asChild className="text-lg px-8 hover:scale-105 transition-transform">
                <Link href="/app">
                  {t.landing.hero.launchApp} <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent hover:scale-105 transition-transform"
              >
                <Play className="mr-2 h-5 w-5" />
                {t.landing.hero.bookDemo}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter end={142} />
                </div>
                <div className="text-sm text-muted-foreground">{t.landing.hero.kpis.campaigns}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter end={2847} />
                </div>
                <div className="text-sm text-muted-foreground">{t.landing.hero.kpis.prospects}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  <AnimatedCounter end={94.2} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">{t.landing.hero.kpis.successRate}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section id="features" className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[var(--font-heading)]">
              {t.landing.features.title}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.landing.features.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{t.landing.features.realTime.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.landing.features.realTime.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{t.landing.features.global.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.landing.features.global.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{t.landing.features.quality.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.landing.features.quality.description}</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>{t.landing.features.enterprise.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{t.landing.features.enterprise.description}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Preview Tabs */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[var(--font-heading)]">
              See the platform in action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore key features with interactive previews of our dashboard, campaign builder, and analytics.
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="prospects">Prospects</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center space-y-4">
                  <TrendingUp className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-semibold">Real-time Dashboard</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Monitor all your campaigns, agents, and prospects from a unified command center with live updates.
                  </p>
                  <Button asChild className="hover:scale-105 transition-transform">
                    <Link href="/app">View Full Dashboard</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center space-y-4">
                  <Target className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-semibold">Campaign Builder</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Create sophisticated multi-step campaigns with country selection, sector targeting, and AI agent
                    configuration.
                  </p>
                  <Button asChild className="hover:scale-105 transition-transform">
                    <Link href="/app">Try Campaign Builder</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="prospects" className="mt-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center space-y-4">
                  <Users className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-semibold">Prospect Management</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Browse, filter, and export high-quality prospects with detailed company information and contact
                    verification.
                  </p>
                  <Button asChild className="hover:scale-105 transition-transform">
                    <Link href="/app">Explore Prospects</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="mt-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center space-y-4">
                  <Bot className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-semibold">AI Agent Monitoring</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Watch your AI agents work in real-time with progress tracking, task queues, and performance metrics.
                  </p>
                  <Button asChild className="hover:scale-105 transition-transform">
                    <Link href="/app">Monitor Agents</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-primary mx-auto" />
                  <h3 className="text-2xl font-semibold">Geographic Analytics</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Visualize global performance with interactive maps, regional insights, and trend analysis.
                  </p>
                  <Button asChild className="hover:scale-105 transition-transform">
                    <Link href="/app">View Analytics</Link>
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[var(--font-heading)]">
              How it works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to transform your international prospecting with AI-powered automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Select Countries & Sectors</h3>
              <p className="text-muted-foreground">
                Choose from all global markets with intelligent autocomplete, region grouping, and sector-specific
                targeting.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Agents Research & Enrich</h3>
              <p className="text-muted-foreground">
                Watch as specialized AI agents discover, verify, and enrich prospects with real-time progress tracking.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Export & Outreach</h3>
              <p className="text-muted-foreground">
                Export verified prospects and launch personalized outreach campaigns with AI-generated content.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[var(--font-heading)]">
              Trusted by global teams
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how companies worldwide are scaling their international prospecting with AI agents.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Increased our European prospect pipeline by 340% in just 3 months. The AI agents work around the
                  clock."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">SH</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sarah Henderson</p>
                    <p className="text-xs text-muted-foreground">VP Sales, TechCorp 🇩🇪</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The quality of prospects from Asia-Pacific markets exceeded our expectations. ROI was immediate."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">ML</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Marc Leblanc</p>
                    <p className="text-xs text-muted-foreground">Director, Global Ventures 🇫🇷</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-0">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "Real-time insights into 12 different markets. Our conversion rate improved by 89% globally."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">AK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Akiko Tanaka</p>
                    <p className="text-xs text-muted-foreground">Head of Growth, Pacific Solutions 🇯🇵</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Logos */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-muted-foreground mb-8">Trusted by companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <Badge variant="outline" className="px-4 py-2 hover:opacity-100 transition-opacity">
                TechCorp Global
              </Badge>
              <Badge variant="outline" className="px-4 py-2 hover:opacity-100 transition-opacity">
                European Ventures
              </Badge>
              <Badge variant="outline" className="px-4 py-2 hover:opacity-100 transition-opacity">
                Asia Pacific Ltd
              </Badge>
              <Badge variant="outline" className="px-4 py-2 hover:opacity-100 transition-opacity">
                Americas Inc
              </Badge>
              <Badge variant="outline" className="px-4 py-2 hover:opacity-100 transition-opacity">
                Nordic Solutions
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg font-[var(--font-heading)]">{t.landing.title}</span>
              </div>
              <p className="text-muted-foreground text-sm">{t.landing.footer.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.landing.footer.product}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.landing.footer.resources}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t.landing.footer.company}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">{t.landing.footer.copyright}</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <LanguageToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
