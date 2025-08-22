"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MapHotspot {
  id: string
  x: number
  y: number
  country: string
  flag: string
  prospects: number
  success: number
  quality: number
}

const hotspots: MapHotspot[] = [
  { id: "de", x: 52, y: 35, country: "Germany", flag: "🇩🇪", prospects: 234, success: 89, quality: 9.2 },
  { id: "fr", x: 48, y: 42, country: "France", flag: "🇫🇷", prospects: 189, success: 92, quality: 8.8 },
  { id: "ca", x: 25, y: 25, country: "Canada", flag: "🇨🇦", prospects: 156, success: 87, quality: 8.5 },
  { id: "gb", x: 47, y: 32, country: "United Kingdom", flag: "🇬🇧", prospects: 98, success: 94, quality: 9.1 },
  { id: "es", x: 45, y: 48, country: "Spain", flag: "🇪🇸", prospects: 76, success: 85, quality: 8.3 },
  { id: "us", x: 22, y: 38, country: "United States", flag: "🇺🇸", prospects: 312, success: 91, quality: 8.9 },
  { id: "jp", x: 85, y: 42, country: "Japan", flag: "🇯🇵", prospects: 145, success: 88, quality: 8.7 },
  { id: "au", x: 82, y: 75, country: "Australia", flag: "🇦🇺", prospects: 67, success: 93, quality: 9.0 },
]

export function WorldMapDashboard() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  return (
    <Card className="h-[400px]">
      <CardHeader>
        <CardTitle>Global Activity</CardTitle>
      </CardHeader>
      <CardContent className="relative h-full">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Simplified world map outline */}
          <path
            d="M15,25 Q20,20 30,22 Q40,18 50,25 Q60,20 70,25 Q80,22 85,28 L85,45 Q80,50 70,48 Q60,52 50,48 Q40,52 30,48 Q20,50 15,45 Z"
            fill="currentColor"
            className="text-muted-foreground/20"
          />

          {/* Additional continents */}
          <path
            d="M70,30 Q75,25 80,30 Q85,28 88,35 L88,50 Q85,55 80,52 Q75,55 70,50 Z"
            fill="currentColor"
            className="text-muted-foreground/20"
          />

          {/* Hotspots */}
          {hotspots.map((hotspot, index) => (
            <g key={hotspot.id}>
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r="2"
                fill="currentColor"
                className="text-primary cursor-pointer animate-pulse"
                style={{
                  animationDelay: `${(index * 0.25) % 2}s`,
                  animationDuration: "3s",
                }}
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              />
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r="4"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-primary/60 animate-ping cursor-pointer"
                style={{
                  animationDelay: `${(index * 0.3) % 2}s`,
                  animationDuration: "4s",
                }}
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              />

              {/* Tooltip */}
              {activeHotspot === hotspot.id && (
                <g>
                  <rect
                    x={hotspot.x - 12}
                    y={hotspot.y - 12}
                    width="24"
                    height="8"
                    fill="currentColor"
                    className="text-popover"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="0.2"
                  />
                  <text
                    x={hotspot.x}
                    y={hotspot.y - 9}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="currentColor"
                    className="text-popover-foreground font-medium"
                  >
                    {hotspot.flag} {hotspot.prospects}
                  </text>
                  <text
                    x={hotspot.x}
                    y={hotspot.y - 7}
                    textAnchor="middle"
                    fontSize="1"
                    fill="currentColor"
                    className="text-muted-foreground"
                  >
                    {hotspot.success}% • {hotspot.quality}/10
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card border border-border rounded-lg p-3 text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Active Markets</span>
            </div>
            <div className="text-muted-foreground">Hover for details</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
