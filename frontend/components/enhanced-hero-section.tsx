"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, Globe, Target, Shield, ArrowRight, Play, Users, TrendingUp, MapPin, Zap, Star, Sparkles } from "lucide-react"
import Link from "next/link"
import { EnhancedAnimatedCounter } from "@/components/enhanced-animated-counter"
import { EnhancedWorldMapBackground } from "@/components/enhanced-world-map-background"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n"
import { useState, useEffect } from "react"

export function EnhancedHeroSection() {
  const { t } = useI18n()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Enhanced Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 animate-slide-in-left">
              <div className="relative">
                <Bot className="h-8 w-8 text-primary animate-float" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span className="text-xl text-foreground font-[var(--font-heading)] gradient-text">
                {t.landing.title}
              </span>
              <Badge variant="outline" className="ml-2 animate-shimmer">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {["features", "how-it-works", "pricing", "contact"].map((item, index) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 staggered-animation"
                  style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
                >
                  {item === "features" ? t.landing.features.title :
                    item === "how-it-works" ? t.landing.howItWorks.title :
                      item.charAt(0).toUpperCase() + item.slice(1)}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4 animate-slide-in-right">
              <LanguageToggle />
              <Button asChild className="hover-lift magnetic-hover animate-glow">
                <Link href="/app">
                  {t.landing.hero.launchApp}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Dynamic background with mouse interaction */}
        <div
          className="absolute inset-0 hero-gradient"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
          }}
        ></div>

        {/* Enhanced world map background */}
        <EnhancedWorldMapBackground />

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-20 h-20 border border-primary/20 animate-float animate-morphing`}
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 2) * 40}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: `${8 + i}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Enhanced headline with staggered animation */}
            <div className="mb-6">
              <Badge variant="outline" className="mb-4 animate-slide-in-up glass-effect">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                🚀 Nouvelle génération d'IA
              </Badge>

              <h1 className="text-4xl md:text-7xl text-foreground mb-6 font-[var(--font-heading)] animate-slide-in-up">
                <span className="gradient-text animate-text-glow">
                  {t.landing.hero.headline.split(' ').slice(0, 2).join(' ')}
                </span>
                <br />
                <span className="text-primary animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                  {t.landing.hero.headline.split(' ').slice(2).join(' ')}
                </span>
              </h1>
            </div>

            {/* Enhanced subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-in-up leading-relaxed" style={{ animationDelay: '0.4s' }}>
              {t.landing.hero.subheadline}
            </p>

            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
              <Button size="lg" asChild className="text-lg px-8 hover-lift magnetic-hover animate-gradient neon-border">
                <Link href="/app">
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.landing.hero.launchApp}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 glass-effect hover-lift magnetic-hover group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                {t.landing.hero.bookDemo}
              </Button>
            </div>

            {/* Enhanced KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-in-up" style={{ animationDelay: '0.8s' }}>
              {[
                { end: 142, label: t.landing.hero.kpis.campaigns, icon: Target, color: "text-blue-500" },
                { end: 2847, label: t.landing.hero.kpis.prospects, icon: Users, color: "text-green-500" },
                { end: 94.2, suffix: "%", label: t.landing.hero.kpis.successRate, icon: TrendingUp, color: "text-purple-500" }
              ].map((kpi, index) => (
                <div
                  key={index}
                  className="perspective-card group"
                >
                  <div className="card-inner glass-effect rounded-xl p-6 hover-lift">
                    <div className="flex items-center justify-center mb-3">
                      <kpi.icon className={`h-8 w-8 ${kpi.color} animate-float`} style={{ animationDelay: `${index * 0.5}s` }} />
                    </div>
                    <div className="text-4xl font-bold text-primary mb-2">
                      <EnhancedAnimatedCounter
                        end={kpi.end}
                        suffix={kpi.suffix || ""}
                        enableGlow={true}
                        enableParticles={true}
                        className="gradient-text"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{kpi.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-16 animate-slide-in-up" style={{ animationDelay: '1s' }}>
              <p className="text-sm text-muted-foreground mb-6">Trusted by innovative companies worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
                {["TechCorp Global", "European Ventures", "Asia Pacific Ltd", "Americas Inc", "Nordic Solutions"].map((company, index) => (
                  <Badge
                    key={company}
                    variant="outline"
                    className="px-4 py-2 hover:opacity-100 transition-all duration-300 hover:scale-105 glass-effect staggered-animation"
                    style={{ '--animation-delay': `${index * 0.1}s` } as React.CSSProperties}
                  >
                    <Star className="w-3 h-3 mr-2 text-yellow-500" />
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>
    </>
  )
}