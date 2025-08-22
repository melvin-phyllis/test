"use client"

import { useState, useEffect } from "react"
import { useHydration } from "@/hooks/use-hydration"

interface Hotspot {
  id: string
  x: number
  y: number
  country: string
  prospects: number
  activity: number
}

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

const hotspots: Hotspot[] = [
  { id: "de", x: 52, y: 35, country: "Germany", prospects: 234, activity: 85 },
  { id: "fr", x: 48, y: 42, country: "France", prospects: 189, activity: 72 },
  { id: "ca", x: 25, y: 25, country: "Canada", prospects: 156, activity: 68 },
  { id: "gb", x: 47, y: 32, country: "United Kingdom", prospects: 98, activity: 91 },
  { id: "es", x: 45, y: 48, country: "Spain", prospects: 76, activity: 45 },
  { id: "us", x: 22, y: 38, country: "United States", prospects: 312, activity: 95 },
  { id: "jp", x: 85, y: 42, country: "Japan", prospects: 145, activity: 78 },
  { id: "au", x: 82, y: 75, country: "Australia", prospects: 67, activity: 52 },
  { id: "br", x: 35, y: 65, country: "Brazil", prospects: 89, activity: 63 },
  { id: "in", x: 75, y: 45, country: "India", prospects: 201, activity: 88 },
  { id: "cn", x: 78, y: 38, country: "China", prospects: 267, activity: 92 },
  { id: "za", x: 55, y: 72, country: "South Africa", prospects: 43, activity: 35 },
]

export function EnhancedWorldMapBackground() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [particles, setParticles] = useState<Particle[]>([])
  const [time, setTime] = useState(0)
  const isHydrated = useHydration()

  useEffect(() => {
    if (!isHydrated) return
    
    const interval = setInterval(() => {
      setTime(prev => prev + 1)

      // Generate new particles occasionally
      if (Math.random() < 0.3) {
        const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)]
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: hotspot.x + (Math.random() - 0.5) * 4,
          y: hotspot.y + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 100
        }

        setParticles(prev => [...prev.slice(-20), newParticle])
      }

      // Update particles
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 1
        })).filter(p => p.life > 0)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isHydrated])

  return (
    <div className="absolute inset-0 opacity-15 overflow-hidden">
      <svg viewBox="0 0 100 60" className="w-full h-full" style={{ minHeight: "100%" }}>
        <defs>
          <radialGradient id="hotspotGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.2" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Enhanced world map outline with multiple continents */}
        <g opacity="0.3">
          {/* North America */}
          <path
            d="M15,25 Q20,20 30,22 Q35,18 40,25 L40,40 Q35,45 25,42 Q20,45 15,40 Z"
            fill="currentColor"
            opacity="0.4"
          />
          {/* Europe */}
          <path
            d="M45,28 Q50,25 55,30 Q58,28 60,32 L58,40 Q55,42 50,40 Q47,42 45,38 Z"
            fill="currentColor"
            opacity="0.4"
          />
          {/* Asia */}
          <path
            d="M62,25 Q70,22 80,28 Q85,25 90,30 L88,45 Q83,48 75,45 Q68,48 62,42 Z"
            fill="currentColor"
            opacity="0.4"
          />
          {/* Africa */}
          <path
            d="M48,45 Q52,42 58,48 Q60,52 58,58 Q55,62 50,60 Q45,62 48,55 Z"
            fill="currentColor"
            opacity="0.4"
          />
          {/* South America */}
          <path
            d="M30,50 Q35,48 40,55 Q38,62 35,68 Q32,70 28,65 Q26,58 30,50 Z"
            fill="currentColor"
            opacity="0.4"
          />
          {/* Australia */}
          <path
            d="M78,70 Q82,68 86,72 Q84,76 80,75 Q76,76 78,70 Z"
            fill="currentColor"
            opacity="0.4"
          />
        </g>

        {/* Connection lines between active hotspots */}
        {hotspots.map((hotspot, i) =>
          hotspots.slice(i + 1).map((otherHotspot, j) => {
            const distance = Math.sqrt(
              Math.pow(hotspot.x - otherHotspot.x, 2) +
              Math.pow(hotspot.y - otherHotspot.y, 2)
            )
            if (distance < 25 && (hotspot.activity > 70 && otherHotspot.activity > 70)) {
              return (
                <line
                  key={`${hotspot.id}-${otherHotspot.id}`}
                  x1={hotspot.x}
                  y1={hotspot.y}
                  x2={otherHotspot.x}
                  y2={otherHotspot.y}
                  stroke="url(#hotspotGradient)"
                  strokeWidth="0.3"
                  opacity={0.4 + Math.sin(time * 0.1) * 0.2}
                  strokeDasharray="2,2"
                />
              )
            }
            return null
          })
        )}

        {/* Floating particles */}
        {particles.map((particle) => (
          <circle
            key={particle.id}
            cx={particle.x}
            cy={particle.y}
            r={0.5}
            fill="#3b82f6"
            opacity={particle.life / 100}
            filter="url(#glow)"
          />
        ))}

        {/* Enhanced hotspots */}
        {hotspots.map((hotspot, index) => {
          const pulseDelay = index * 0.2
          const isHighActivity = hotspot.activity > 80

          return (
            <g key={hotspot.id}>
              {/* Outer glow ring */}
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r={4 + Math.sin(time * 0.1 + pulseDelay) * 1}
                fill="none"
                stroke="url(#hotspotGradient)"
                strokeWidth="0.5"
                opacity={0.3 + Math.sin(time * 0.1 + pulseDelay) * 0.2}
              />

              {/* Middle ring */}
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r={2.5}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.3"
                opacity={0.6}
                className="animate-ping"
                style={{
                  animationDelay: `${pulseDelay}s`,
                  animationDuration: "3s",
                }}
              />

              {/* Core dot */}
              <circle
                cx={hotspot.x}
                cy={hotspot.y}
                r={isHighActivity ? "2" : "1.5"}
                fill={isHighActivity ? "#60a5fa" : "#3b82f6"}
                filter="url(#glow)"
                className="cursor-pointer"
                onMouseEnter={() => setActiveHotspot(hotspot.id)}
                onMouseLeave={() => setActiveHotspot(null)}
              />

              {/* Activity indicator */}
              {isHighActivity && (
                <circle
                  cx={hotspot.x}
                  cy={hotspot.y}
                  r={6}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="0.2"
                  opacity={0.4 + Math.sin(time * 0.15 + pulseDelay) * 0.3}
                  strokeDasharray="1,1"
                  transform={`rotate(${time * 2 + index * 30} ${hotspot.x} ${hotspot.y})`}
                />
              )}

              {/* Enhanced tooltip */}
              {activeHotspot === hotspot.id && (
                <g className="animate-scale-in">
                  <rect
                    x={hotspot.x - 8}
                    y={hotspot.y - 12}
                    width="16"
                    height="8"
                    fill="rgba(30, 58, 138, 0.95)"
                    rx="1"
                    filter="url(#glow)"
                  />
                  <text
                    x={hotspot.x}
                    y={hotspot.y - 9}
                    textAnchor="middle"
                    fontSize="1.1"
                    fill="white"
                    fontWeight="bold"
                  >
                    {hotspot.country}
                  </text>
                  <text
                    x={hotspot.x}
                    y={hotspot.y - 7}
                    textAnchor="middle"
                    fontSize="0.9"
                    fill="#93c5fd"
                  >
                    {hotspot.prospects} prospects • {hotspot.activity}% active
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* Animated data streams */}
        {hotspots.filter(h => h.activity > 75).map((hotspot, i) => (
          <g key={`stream-${hotspot.id}`}>
            {[...Array(3)].map((_, streamIndex) => (
              <circle
                key={streamIndex}
                cx={hotspot.x}
                cy={hotspot.y}
                r="0.5"
                fill="#60a5fa"
                opacity={0.8}
                transform={`translate(${Math.cos(time * 0.05 + streamIndex * 2) * 8}, ${Math.sin(time * 0.05 + streamIndex * 2) * 8})`}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  )
}