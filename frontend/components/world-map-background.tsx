"use client"

import { useState } from "react"

interface Hotspot {
  id: string
  x: number
  y: number
  country: string
  prospects: number
}

const hotspots: Hotspot[] = [
  { id: "de", x: 52, y: 35, country: "Germany", prospects: 234 },
  { id: "fr", x: 48, y: 42, country: "France", prospects: 189 },
  { id: "ca", x: 25, y: 25, country: "Canada", prospects: 156 },
  { id: "gb", x: 47, y: 32, country: "United Kingdom", prospects: 98 },
  { id: "es", x: 45, y: 48, country: "Spain", prospects: 76 },
  { id: "us", x: 22, y: 38, country: "United States", prospects: 312 },
  { id: "jp", x: 85, y: 42, country: "Japan", prospects: 145 },
  { id: "au", x: 82, y: 75, country: "Australia", prospects: 67 },
]

export function WorldMapBackground() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  return (
    <div className="absolute inset-0 opacity-10 overflow-hidden">
      <svg viewBox="0 0 100 60" className="w-full h-full" style={{ minHeight: "100%" }}>
        {/* Simplified world map outline */}
        <path
          d="M15,25 Q20,20 30,22 Q40,18 50,25 Q60,20 70,25 Q80,22 85,28 L85,45 Q80,50 70,48 Q60,52 50,48 Q40,52 30,48 Q20,50 15,45 Z"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Hotspots */}
        {hotspots.map((hotspot) => (
          <g key={hotspot.id}>
            <circle
              cx={hotspot.x}
              cy={hotspot.y}
              r="1.5"
              fill="currentColor"
              className="animate-pulse"
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "3s",
              }}
              onMouseEnter={() => setActiveHotspot(hotspot.id)}
              onMouseLeave={() => setActiveHotspot(null)}
            />
            <circle
              cx={hotspot.x}
              cy={hotspot.y}
              r="3"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              opacity="0.6"
              className="animate-ping"
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "4s",
              }}
            />

            {/* Tooltip */}
            {activeHotspot === hotspot.id && (
              <g>
                <rect
                  x={hotspot.x - 6}
                  y={hotspot.y - 8}
                  width="12"
                  height="4"
                  fill="currentColor"
                  rx="0.5"
                  opacity="0.9"
                />
                <text x={hotspot.x} y={hotspot.y - 6} textAnchor="middle" fontSize="1.2" fill="white" opacity="1">
                  {hotspot.country}: {hotspot.prospects}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}
