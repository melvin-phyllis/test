"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WorldMapDashboard } from "@/components/app/world-map-dashboard"
import { campaignApi, prospectApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { Campaign, Prospect } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const countryFlags: { [key: string]: string } = {
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "United Kingdom": "🇬🇧",
  "Italy": "🇮🇹",
  "Spain": "🇪🇸",
  "Netherlands": "🇳🇱",
  "Belgium": "🇧🇪",
  "Switzerland": "🇨🇭",
  "Canada": "🇨🇦",
  "United States": "🇺🇸",
  "International": "🌍",
  "Côte d'Ivoire": "🇨🇮"
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Charger les données
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsLoading(true)
        const [campaignData, prospectData] = await Promise.all([
          campaignApi.getCampaigns(),
          prospectApi.getProspects()
        ])
        setCampaigns(campaignData)
        setProspects(prospectData)
      } catch (error) {
        console.error('Failed to load analytics data:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données analytiques",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
    
    // Recharger toutes les minutes
    const interval = setInterval(loadAnalyticsData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculer les données pour les graphiques
  const getRegionData = () => {
    const locationCounts: { [key: string]: { prospects: number; success: number } } = {}
    
    campaigns.forEach(campaign => {
      const region = campaign.target_location
      if (!locationCounts[region]) {
        locationCounts[region] = { prospects: 0, success: 0 }
      }
      locationCounts[region].prospects += campaign.results_summary?.prospects_found || 0
      if (campaign.status === 'completed') {
        locationCounts[region].success += 1
      }
    })

    return Object.entries(locationCounts).map(([region, data], index) => ({
      region,
      prospects: data.prospects,
      success: data.success > 0 ? Math.round((data.success / campaigns.filter(c => c.target_location === region).length) * 100) : 0,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }))
  }

  const getTrendData = () => {
    // Grouper les campagnes par mois
    const monthlyData: { [key: string]: { prospects: number; campaigns: number } } = {}
    
    campaigns.forEach(campaign => {
      const date = new Date(campaign.created_at)
      const monthKey = date.toLocaleString('fr-FR', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { prospects: 0, campaigns: 0 }
      }
      monthlyData[monthKey].prospects += campaign.results_summary?.prospects_found || 0
      monthlyData[monthKey].campaigns += 1
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      prospects: data.prospects,
      success: data.campaigns > 0 ? Math.round((data.prospects / data.campaigns) * 10) : 0
    }))
  }

  const getCountryPerformance = () => {
    return campaigns
      .map(campaign => ({
        country: `${countryFlags[campaign.target_location] || "🌍"} ${campaign.target_location}`,
        prospects: campaign.results_summary?.prospects_found || 0,
        success: campaign.status === 'completed' ? 100 : campaign.status === 'running' ? 50 : 0,
        quality: campaign.results_summary?.prospects_found ? Math.min(10, (campaign.results_summary.prospects_found / campaign.prospect_count) * 10) : 0
      }))
      .filter(item => item.prospects > 0)
      .sort((a, b) => b.prospects - a.prospects)
      .slice(0, 5)
  }

  const regionData = getRegionData()
  const trendData = getTrendData()
  const countryPerformance = getCountryPerformance()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Geographic Analytics</h1>
        <p className="text-muted-foreground">Visualize global performance with interactive insights</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pays ciblés</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse bg-muted rounded h-8 w-12"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{new Set(campaigns.map(c => c.target_location)).size}</div>
                <p className="text-xs text-green-600">Total des marchés</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meilleur région</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse bg-muted rounded h-8 w-20"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {regionData.length > 0 ? regionData[0].region : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {regionData.length > 0 ? `${regionData[0].success}% succès` : "Aucune donnée"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plus haute densité</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse bg-muted rounded h-8 w-24"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {countryPerformance.length > 0 ? countryPerformance[0].country : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {countryPerformance.length > 0 ? `${countryPerformance[0].prospects} prospects` : "Aucune donnée"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campagnes actives</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold animate-pulse bg-muted rounded h-8 w-12"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {campaigns.filter(c => c.status === 'running').length}
                </div>
                <p className="text-xs text-muted-foreground">En cours d'exécution</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <WorldMapDashboard />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution régionale</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-muted-foreground">Chargement des données...</div>
              </div>
            ) : regionData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-muted-foreground">Aucune donnée disponible</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="prospects" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux de succès par région</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-muted-foreground">Chargement des données...</div>
              </div>
            ) : regionData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px]">
                <div className="text-muted-foreground">Aucune donnée disponible</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="success"
                    label={({ region, success }) => `${region}: ${success}%`}
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tendances de croissance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-muted-foreground">Chargement des tendances...</div>
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="text-muted-foreground">Pas assez de données historiques</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="prospects" stroke="#3b82f6" strokeWidth={2} name="Prospects" />
                <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} name="Score qualité" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Country Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par pays</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="bg-muted rounded h-6 w-32 animate-pulse"></div>
                  <div className="bg-muted rounded h-6 w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : countryPerformance.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Aucune performance de pays disponible</div>
              <p className="text-sm text-muted-foreground mt-2">Créez des campagnes pour voir les performances</p>
            </div>
          ) : (
            <div className="space-y-4">
              {countryPerformance.map((country, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{country.country}</span>
                    <Badge variant="outline">{country.prospects} prospects</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Succès:</span>
                      <Progress value={country.success} className="w-16 h-2" />
                      <span className="text-sm font-medium">{country.success}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Qualité:</span>
                      <span className="text-sm font-medium text-green-600">{Math.round(country.quality * 10) / 10}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
