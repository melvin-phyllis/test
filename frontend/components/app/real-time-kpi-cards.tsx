"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Users, BarChart3, Loader2 } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"
import { useWebSocket } from "./websocket-provider"
import { useCampaigns, useProspects, useAppLoading, useAppStore } from "@/lib/store"
import { campaignApi, prospectApi } from "@/lib/api"

interface KpiData {
  totalCampaigns: number
  activeCampaigns: number
  totalProspects: number
  successRate: number
}

export function RealTimeKpiCards() {
  const { lastMessage } = useWebSocket()
  const campaigns = useCampaigns()
  const prospects = useProspects()
  const isLoading = useAppLoading()
  const { setCampaigns, setProspects, setLoading, setError } = useAppStore()
  
  const [kpiData, setKpiData] = useState<KpiData>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalProspects: 0,
    successRate: 0,
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const [campaignsData, prospectsData] = await Promise.all([
          campaignApi.getCampaigns(),
          prospectApi.getProspects({ limit: 1000 })
        ])
        
        setCampaigns(campaignsData)
        setProspects(prospectsData)
      } catch (error) {
        console.error('Failed to load data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [setCampaigns, setProspects, setLoading, setError])

  // Calculate KPIs from real data
  useEffect(() => {
    const activeCampaigns = campaigns.filter(c => c.status === 'running').length
    const completedCampaigns = campaigns.filter(c => c.status === 'completed').length
    const convertedProspects = prospects.filter(p => p.status === 'converted').length
    const successRate = prospects.length > 0 ? (convertedProspects / prospects.length) * 100 : 0

    setKpiData({
      totalCampaigns: campaigns.length,
      activeCampaigns,
      totalProspects: prospects.length,
      successRate: Number(successRate.toFixed(1)),
    })
  }, [campaigns, prospects])

  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case "campaign_update":
        if (lastMessage.data.status === "completed") {
          setKpiData((prev) => ({
            ...prev,
            activeCampaigns: Math.max(0, prev.activeCampaigns - 1),
          }))
        }
        break

      case "prospect_found":
        setKpiData((prev) => ({
          ...prev,
          totalProspects: prev.totalProspects + 1,
        }))
        break

      case "agent_activity":
        // Simulate small improvements in success rate
        if (lastMessage.data.message?.includes("verified") || lastMessage.data.message?.includes("completed")) {
          setKpiData((prev) => ({
            ...prev,
            successRate: Math.min(100, prev.successRate + Math.random() * 0.1),
          }))
        }
        break
    }
  }, [lastMessage])

  const kpiCards = [
    {
      title: "Total Campaigns",
      value: kpiData.totalCampaigns,
      change: "+12",
      period: "this month",
      icon: Target,
      trend: "up",
    },
    {
      title: "Active Campaigns",
      value: kpiData.activeCampaigns,
      change: "running now",
      period: "",
      icon: BarChart3,
      trend: "neutral",
    },
    {
      title: "Total Prospects",
      value: kpiData.totalProspects,
      change: "+234",
      period: "this week",
      icon: Users,
      trend: "up",
    },
    {
      title: "Success Rate",
      value: kpiData.successRate,
      suffix: "%",
      change: "+2.1%",
      period: "vs last month",
      icon: TrendingUp,
      trend: "up",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiCards.map((kpi) => (
        <Card key={kpi.title} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter end={kpi.value} suffix={kpi.suffix || ""} />
            </div>
            {kpi.change && (
              <p className="text-xs text-muted-foreground mt-1">
                <span
                  className={
                    kpi.trend === "up" ? "text-green-600" : kpi.trend === "down" ? "text-red-600" : "text-blue-600"
                  }
                >
                  {kpi.change}
                </span>
                {kpi.period && ` ${kpi.period}`}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
