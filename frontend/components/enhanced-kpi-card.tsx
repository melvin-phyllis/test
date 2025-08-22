"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedAnimatedCounter } from "@/components/enhanced-animated-counter"
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react"
import { useState } from "react"

interface EnhancedKPICardProps {
  title: string
  value: number
  suffix?: string
  prefix?: string
  trend?: number
  trendLabel?: string
  icon: React.ComponentType<any>
  color?: string
  description?: string
  isLoading?: boolean
  className?: string
}

export function EnhancedKPICard({
  title,
  value,
  suffix = "",
  prefix = "",
  trend,
  trendLabel,
  icon: Icon,
  color = "text-primary",
  description,
  isLoading = false,
  className = ""
}: EnhancedKPICardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getTrendIcon = () => {
    if (!trend) return Minus
    return trend > 0 ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground"
    return trend > 0 ? "text-green-500" : "text-red-500"
  }

  const TrendIcon = getTrendIcon()

  if (isLoading) {
    return (
      <Card className={`hover-lift animate-scale-in ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 bg-muted rounded animate-shimmer w-24"></div>
          </CardTitle>
          <div className="h-4 w-4 bg-muted rounded animate-shimmer"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded animate-shimmer w-20 mb-2"></div>
          <div className="h-3 bg-muted rounded animate-shimmer w-16"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`perspective-card hover-lift card-hover-effect transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-inner">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="relative">
            <Icon className={`h-4 w-4 ${color} transition-all duration-300 ${isHovered ? 'animate-float' : ''}`} />
            {isHovered && (
              <div className="absolute -top-1 -right-1 w-2 h-2">
                <Sparkles className="w-2 h-2 text-yellow-400 animate-ping" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-baseline space-x-2 mb-2">
            <div className={`text-2xl font-bold ${color} transition-all duration-300`}>
              <EnhancedAnimatedCounter
                end={value}
                prefix={prefix}
                suffix={suffix}
                enableGlow={isHovered}
                enableParticles={isHovered}
                className="gradient-text"
              />
            </div>

            {trend !== undefined && (
              <Badge
                variant="outline"
                className={`${getTrendColor()} border-current glass-effect animate-scale-in`}
              >
                <TrendIcon className="w-3 h-3 mr-1" />
                {Math.abs(trend)}%
              </Badge>
            )}
          </div>

          {(description || trendLabel) && (
            <div className="space-y-1">
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trendLabel && (
                <p className={`text-xs ${getTrendColor()} font-medium`}>
                  {trendLabel}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}