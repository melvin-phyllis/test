"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Users, BarChart3 } from "lucide-react"
import { AnimatedCounter } from "@/components/animated-counter"

const kpiData = [
  {
    title: "Total Campaigns",
    value: 142,
    change: "+12",
    period: "this month",
    icon: Target,
    trend: "up",
  },
  {
    title: "Active Campaigns",
    value: 8,
    change: "Running now",
    period: "",
    icon: BarChart3,
    trend: "neutral",
  },
  {
    title: "Total Prospects",
    value: 2847,
    change: "+234",
    period: "this week",
    icon: Users,
    trend: "up",
  },
  {
    title: "Success Rate",
    value: 94.2,
    suffix: "%",
    change: "+2.1%",
    period: "vs last month",
    icon: TrendingUp,
    trend: "up",
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi) => (
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
