import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedKPICardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ElementType
  trend?: "up" | "down" | "stable"
  className?: string
  animated?: boolean
}

export function EnhancedKPICard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = "up",
  className,
  animated = false,
}: EnhancedKPICardProps) {
  const isPositive = change > 0
  const isNegative = change < 0

  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp
    if (trend === "down") return TrendingDown
    return ArrowUpRight
  }

  const TrendIcon = getTrendIcon()

  return (
    <Card
      className={cn(
        "border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
        animated && "animate-float",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-bold">{value}</p>
              {change !== 0 && (
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className={cn(
                    "text-xs",
                    isPositive && "bg-accent/10 text-accent hover:bg-accent/20",
                    isNegative && "bg-destructive/10 text-destructive hover:bg-destructive/20",
                  )}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {Math.abs(change)}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{changeLabel}</p>
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              isPositive ? "bg-accent/10" : "bg-primary/10",
            )}
          >
            <Icon className={cn("w-6 h-6", isPositive ? "text-accent" : "text-primary", animated && "animate-pulse")} />
          </div>
        </div>

        {/* Trend indicator */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <TrendIcon
              className={cn(
                "w-4 h-4",
                trend === "up" ? "text-accent" : trend === "down" ? "text-destructive" : "text-muted-foreground",
              )}
            />
            <span className="text-xs text-muted-foreground">
              Tendance {trend === "up" ? "positive" : trend === "down" ? "négative" : "stable"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
