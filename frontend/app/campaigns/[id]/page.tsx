import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  MessageSquare,
  Edit,
} from "lucide-react"
import Link from "next/link"

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  // Mock campaign data - in real app, fetch from backend
  const campaign = {
    id: params.id,
    name: "Campagne Tech Startups Q1",
    description: "Prospection ciblée des startups technologiques en France",
    status: "active",
    type: "email",
    createdAt: "2024-01-15",
    startDate: "2024-01-20",
    endDate: "2024-03-20",
    prospects: 1247,
    contacted: 892,
    responses: 156,
    meetings: 23,
    conversionRate: 17.5,
    agent: {
      name: "Prospecteur Principal",
      avatar: "/blue-ai-robot.png",
    },
    targeting: {
      industries: ["Technologie", "SaaS", "FinTech"],
      positions: ["CEO", "CTO", "Founder"],
      locations: ["Paris", "Lyon", "Marseille"],
      companySize: "startup",
    },
    performance: {
      openRate: 68,
      clickRate: 24,
      responseRate: 17.5,
      meetingRate: 2.6,
    },
  }

  const recentActivity = [
    {
      id: 1,
      type: "response",
      prospect: "Marie Dubois",
      company: "TechCorp",
      message: "Intéressée par une démonstration",
      time: "Il y a 5 min",
      avatar: "/professional-woman-diverse.png",
    },
    {
      id: 2,
      type: "meeting",
      prospect: "Jean Martin",
      company: "InnovateLab",
      message: "RDV planifié pour demain 14h",
      time: "Il y a 15 min",
      avatar: "/professional-man.png",
    },
    {
      id: 3,
      type: "contact",
      prospect: "Sophie Laurent",
      company: "DataFlow",
      message: "Premier contact envoyé",
      time: "Il y a 1h",
      avatar: "/professional-woman-executive.png",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Active", variant: "default" as const },
      paused: { label: "En pause", variant: "secondary" as const },
      completed: { label: "Terminée", variant: "outline" as const },
      draft: { label: "Brouillon", variant: "secondary" as const },
    }
    return statusConfig[status as keyof typeof statusConfig] || { label: status, variant: "secondary" as const }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "response":
        return <MessageSquare className="w-4 h-4 text-green-600" />
      case "meeting":
        return <Calendar className="w-4 h-4 text-blue-600" />
      case "contact":
        return <Mail className="w-4 h-4 text-primary" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-serif font-bold">{campaign.name}</h1>
              <Badge variant={getStatusBadge(campaign.status).variant}>{getStatusBadge(campaign.status).label}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          {campaign.status === "active" ? (
            <Button variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Reprendre
            </Button>
          )}
          <Button variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prospects</p>
                <p className="text-2xl font-bold">{campaign.prospects.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contactés</p>
                <p className="text-2xl font-bold">{campaign.contacted.toLocaleString()}</p>
              </div>
              <Mail className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Réponses</p>
                <p className="text-2xl font-bold">{campaign.responses}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">RDV</p>
                <p className="text-2xl font-bold">{campaign.meetings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance de la campagne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux d'ouverture</span>
                    <span className="font-medium">{campaign.performance.openRate}%</span>
                  </div>
                  <Progress value={campaign.performance.openRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de clic</span>
                    <span className="font-medium">{campaign.performance.clickRate}%</span>
                  </div>
                  <Progress value={campaign.performance.clickRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de réponse</span>
                    <span className="font-medium">{campaign.performance.responseRate}%</span>
                  </div>
                  <Progress value={campaign.performance.responseRate} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taux de RDV</span>
                    <span className="font-medium">{campaign.performance.meetingRate}%</span>
                  </div>
                  <Progress value={campaign.performance.meetingRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {activity.prospect
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getActivityIcon(activity.type)}
                          <p className="text-sm font-medium">{activity.prospect}</p>
                          <span className="text-xs text-muted-foreground">• {activity.company}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la campagne</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Agent assigné</h4>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={campaign.agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{campaign.agent.name}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Période</h4>
                    <p className="text-sm text-muted-foreground">
                      Du {new Date(campaign.startDate).toLocaleDateString()} au{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Ciblage</h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Secteurs:</span>
                        {campaign.targeting.industries.map((industry) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground">Postes:</span>
                        {campaign.targeting.positions.map((position) => (
                          <Badge key={position} variant="outline" className="text-xs">
                            {position}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospects">
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Liste des prospects</h3>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Templates de messages</h3>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics détaillées</h3>
              <p className="text-muted-foreground">Fonctionnalité en cours de développement</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
