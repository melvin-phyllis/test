"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Sparkles,
  Target,
  Users,
  TrendingUp,
  Globe,
  Zap,
  Star,
  ArrowRight,
  Play,
  Download
} from "lucide-react"

// Import our enhanced components
import { EnhancedAnimatedCounter } from "@/components/enhanced-animated-counter"
import { EnhancedWorldMapBackground } from "@/components/enhanced-world-map-background"
import { EnhancedKPICard } from "@/components/enhanced-kpi-card"
import { EnhancedDataTable } from "@/components/enhanced-data-table"
import { NotificationProvider, useNotificationHelpers } from "@/components/enhanced-notification-system"

// Sample data for the table
const sampleData = [
  { id: 1, company: "TechCorp", country: "Germany", prospects: 45, status: "Active", score: 92 },
  { id: 2, company: "InnovateLtd", country: "France", prospects: 32, status: "Pending", score: 87 },
  { id: 3, company: "GlobalSoft", country: "USA", prospects: 67, status: "Active", score: 95 },
  { id: 4, company: "DataFlow", country: "Japan", prospects: 23, status: "Completed", score: 89 },
  { id: 5, company: "CloudTech", country: "Canada", prospects: 41, status: "Active", score: 91 },
]

const tableColumns = [
  { key: 'company', label: 'Company', sortable: true },
  { key: 'country', label: 'Country', sortable: true },
  { key: 'prospects', label: 'Prospects', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <Badge variant={value === 'Active' ? 'default' : value === 'Pending' ? 'secondary' : 'outline'}>
        {value}
      </Badge>
    )
  },
  { key: 'score', label: 'Score', sortable: true },
]

function DemoContent() {
  const [isLoading, setIsLoading] = useState(false)
  const notifications = useNotificationHelpers()

  const handleTestNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: "Campaign Created!", message: "Your AI prospecting campaign is now running." },
      error: { title: "Connection Failed", message: "Unable to connect to the AI service." },
      warning: { title: "API Limit Warning", message: "You're approaching your monthly API limit." },
      info: { title: "New Feature Available", message: "Check out our enhanced analytics dashboard." }
    }

    notifications[type](
      messages[type].title,
      messages[type].message,
      {
        label: "View Details",
        onClick: () => console.log(`${type} action clicked`)
      }
    )
  }

  const toggleLoading = () => {
    setIsLoading(!isLoading)
    setTimeout(() => setIsLoading(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 animate-slide-in-left">
              <div className="relative">
                <Bot className="h-8 w-8 text-primary animate-float" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <span className="font-bold text-xl text-foreground gradient-text">
                AI Prospecting Demo
              </span>
              <Badge variant="outline" className="ml-2 animate-shimmer">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced UI
              </Badge>
            </div>

            <div className="flex items-center space-x-4 animate-slide-in-right">
              <Button onClick={toggleLoading} variant="outline" className="hover-lift">
                {isLoading ? "Loading..." : "Toggle Loading"}
              </Button>
              <Button className="hover-lift magnetic-hover animate-glow">
                <ArrowRight className="ml-2 h-4 w-4" />
                Back to App
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced Background */}
      <section className="relative py-20 overflow-hidden">
        <EnhancedWorldMapBackground />
        <div className="absolute inset-0 hero-gradient"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-in-up">
              <span className="gradient-text animate-text-glow">Enhanced UI</span>
              <br />
              <span className="text-primary">Components Demo</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              Découvrez les nouvelles animations et effets visuels de votre plateforme de prospection IA
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" className="text-lg px-8 hover-lift magnetic-hover animate-gradient neon-border">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button size="lg" variant="outline" className="text-lg px-8 glass-effect hover-lift group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Components Showcase */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-in-up">
              Enhanced Components
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              Découvrez les améliorations visuelles et interactions
            </p>
          </div>

          <Tabs defaultValue="kpis" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="kpis">KPI Cards</TabsTrigger>
              <TabsTrigger value="counters">Counters</TabsTrigger>
              <TabsTrigger value="tables">Data Tables</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="kpis" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <EnhancedKPICard
                  title="Total Campaigns"
                  value={142}
                  trend={12.5}
                  trendLabel="vs last month"
                  icon={Target}
                  color="text-blue-500"
                  description="Active prospecting campaigns"
                  isLoading={isLoading}
                />

                <EnhancedKPICard
                  title="Prospects Generated"
                  value={2847}
                  trend={-3.2}
                  trendLabel="vs last week"
                  icon={Users}
                  color="text-green-500"
                  description="Qualified prospects found"
                  isLoading={isLoading}
                />

                <EnhancedKPICard
                  title="Success Rate"
                  value={94.2}
                  suffix="%"
                  trend={5.8}
                  trendLabel="improvement"
                  icon={TrendingUp}
                  color="text-purple-500"
                  description="Campaign effectiveness"
                  isLoading={isLoading}
                />
              </div>
            </TabsContent>

            <TabsContent value="counters" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center p-6 hover-lift">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Basic Counter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      <EnhancedAnimatedCounter end={1234} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 hover-lift">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">With Glow Effect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      <EnhancedAnimatedCounter end={567} enableGlow={true} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 hover-lift">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">With Particles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      <EnhancedAnimatedCounter end={89} suffix="%" enableParticles={true} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="text-center p-6 hover-lift">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Full Effects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      <EnhancedAnimatedCounter
                        end={999}
                        prefix="$"
                        enableGlow={true}
                        enableParticles={true}
                        className="gradient-text"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tables" className="space-y-8">
              <EnhancedDataTable
                title="Campaign Performance"
                description="Real-time data with enhanced interactions"
                data={sampleData}
                columns={tableColumns}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="notifications" className="space-y-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Notification System Demo</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Test the enhanced notification system with different types and animations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button
                      onClick={() => handleTestNotification('success')}
                      className="hover-lift"
                      variant="outline"
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-green-500" />
                      Success
                    </Button>

                    <Button
                      onClick={() => handleTestNotification('error')}
                      className="hover-lift"
                      variant="outline"
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-red-500" />
                      Error
                    </Button>

                    <Button
                      onClick={() => handleTestNotification('warning')}
                      className="hover-lift"
                      variant="outline"
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                      Warning
                    </Button>

                    <Button
                      onClick={() => handleTestNotification('info')}
                      className="hover-lift"
                      variant="outline"
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
                      Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Animation Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-slide-in-up">
              Animation Showcase
            </h2>
            <p className="text-xl text-muted-foreground animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              Différents effets visuels et animations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-lift perspective-card">
              <div className="card-inner">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 animate-float" />
                    Hover Effects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hover over this card to see the 3D perspective effect
                  </p>
                </CardContent>
              </div>
            </Card>

            <Card className="glass-effect animate-morphing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500 animate-float" />
                  Glass Effect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Glassmorphism design with morphing animation
                </p>
              </CardContent>
            </Card>

            <Card className="neon-border animate-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500 animate-float" />
                  Neon Glow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Neon border with glowing animation effect
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function DemoPage() {
  return (
    <NotificationProvider>
      <DemoContent />
    </NotificationProvider>
  )
}