"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Mail,
  Phone,
  Download,
  Filter,
  BarChart3,
  PieChartIcon,
  Activity,
} from "lucide-react"

// Données simulées pour les analytics
const conversionData = [
  { month: "Jan", prospects: 1200, qualified: 480, converted: 96 },
  { month: "Fév", prospects: 1350, qualified: 540, converted: 108 },
  { month: "Mar", prospects: 1100, qualified: 440, converted: 88 },
  { month: "Avr", prospects: 1450, qualified: 580, converted: 116 },
  { month: "Mai", prospects: 1600, qualified: 640, converted: 128 },
  { month: "Jun", prospects: 1750, qualified: 700, converted: 140 },
]

const channelData = [
  { name: "Email", value: 45, color: "#164e63" },
  { name: "LinkedIn", value: 30, color: "#84cc16" },
  { name: "Téléphone", value: 15, color: "#06b6d4" },
  { name: "Autres", value: 10, color: "#64748b" },
]

const performanceData = [
  { agent: "Agent Commercial", success: 85, attempts: 120, conversion: 12.5 },
  { agent: "Agent Marketing", success: 92, attempts: 150, conversion: 15.3 },
  { agent: "Agent Recherche", success: 78, attempts: 200, conversion: 8.9 },
  { agent: "Agent Suivi", success: 88, attempts: 180, conversion: 11.2 },
]

const timelineData = [
  { time: "00:00", activity: 12 },
  { time: "04:00", activity: 8 },
  { time: "08:00", activity: 45 },
  { time: "12:00", activity: 38 },
  { time: "16:00", activity: 52 },
  { time: "20:00", activity: 25 },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("conversion")

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Analytics</h1>
          <p className="text-muted-foreground mt-1">Analysez les performances de votre prospection IA</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects Générés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,450</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-accent" />
              +12.5% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-accent" />
              +2.1% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Envoyés</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,680</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -3.2% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appels Effectués</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,240</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-accent" />
              +8.7% vs mois dernier
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="channels">Canaux</TabsTrigger>
          <TabsTrigger value="agents">Agents IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution des Conversions
                </CardTitle>
                <CardDescription>Prospects générés vs convertis sur 6 mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="prospects"
                      stackId="1"
                      stroke="#164e63"
                      fill="#164e63"
                      fillOpacity={0.6}
                      name="Prospects"
                    />
                    <Area
                      type="monotone"
                      dataKey="qualified"
                      stackId="2"
                      stroke="#84cc16"
                      fill="#84cc16"
                      fillOpacity={0.6}
                      name="Qualifiés"
                    />
                    <Area
                      type="monotone"
                      dataKey="converted"
                      stackId="3"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.8}
                      name="Convertis"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité par Heure
                </CardTitle>
                <CardDescription>Distribution de l'activité de prospection</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="activity" fill="#164e63" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des Campagnes</CardTitle>
              <CardDescription>Analyse détaillée des performances par agent IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{agent.agent}</h4>
                        <p className="text-sm text-muted-foreground">{agent.attempts} tentatives</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium">{agent.success} succès</div>
                        <Progress value={(agent.success / agent.attempts) * 100} className="w-20" />
                      </div>
                      <Badge variant={agent.conversion > 12 ? "default" : "secondary"}>{agent.conversion}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Répartition par Canal
                </CardTitle>
                <CardDescription>Distribution des prospects par canal de communication</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficacité par Canal</CardTitle>
                <CardDescription>Taux de conversion et ROI par canal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelData.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                        <span className="font-medium">{channel.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{channel.value}%</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor(Math.random() * 20 + 5)}% conversion
                          </div>
                        </div>
                        <Progress value={channel.value} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceData.map((agent, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{agent.agent}</CardTitle>
                  <CardDescription>Performance des 30 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taux de succès</span>
                      <span className="font-medium">{((agent.success / agent.attempts) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(agent.success / agent.attempts) * 100} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Conversion</span>
                      <Badge variant={agent.conversion > 12 ? "default" : "secondary"}>{agent.conversion}%</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tentatives</span>
                      <span className="font-medium">{agent.attempts}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
