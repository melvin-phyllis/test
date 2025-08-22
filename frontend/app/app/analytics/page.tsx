"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WorldMapDashboard } from "@/components/app/world-map-dashboard"
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

const regionData = [
  { region: "Europe", prospects: 456, success: 89, color: "#3b82f6" },
  { region: "North America", prospects: 312, success: 91, color: "#10b981" },
  { region: "Asia Pacific", prospects: 234, success: 87, color: "#f59e0b" },
  { region: "Latin America", prospects: 89, success: 85, color: "#ef4444" },
  { region: "Middle East & Africa", prospects: 67, success: 82, color: "#8b5cf6" },
]

const trendData = [
  { month: "Jan", prospects: 120, success: 88 },
  { month: "Feb", prospects: 180, success: 90 },
  { month: "Mar", prospects: 240, success: 92 },
  { month: "Apr", prospects: 320, success: 89 },
  { month: "May", prospects: 380, success: 94 },
  { month: "Jun", prospects: 456, success: 91 },
]

const countryPerformance = [
  { country: "🇩🇪 Germany", prospects: 234, success: 89, quality: 9.2 },
  { country: "🇫🇷 France", prospects: 189, success: 92, quality: 8.8 },
  { country: "🇺🇸 United States", prospects: 156, success: 87, quality: 8.9 },
  { country: "🇨🇦 Canada", prospects: 145, success: 94, quality: 9.1 },
  { country: "🇬🇧 United Kingdom", prospects: 98, success: 88, quality: 8.7 },
]

export default function AnalyticsPage() {
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Countries Targeted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-600">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Europe</div>
            <p className="text-xs text-muted-foreground">89% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Density</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🇩🇪 Germany</div>
            <p className="text-xs text-muted-foreground">234 prospects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Expansion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5</div>
            <p className="text-xs text-muted-foreground">countries/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Map */}
      <WorldMapDashboard />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="prospects" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Region</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="prospects" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Country Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Country Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countryPerformance.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">{country.country}</span>
                  <Badge variant="outline">{country.prospects} prospects</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Success:</span>
                    <Progress value={country.success} className="w-16 h-2" />
                    <span className="text-sm font-medium">{country.success}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Quality:</span>
                    <span className="text-sm font-medium text-green-600">{country.quality}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
