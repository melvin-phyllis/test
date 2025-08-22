"use client"

import type React from "react"
import {
  Rocket,
  DollarSign,
  Heart,
  ShoppingCart,
  Cloud,
  Factory,
  Car,
  Home,
  Zap,
  BookOpen,
  Sprout,
  Shield,
} from "lucide-react"

interface Sector {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
}

const sectors: Sector[] = [
  { id: "technology", name: "Technology", icon: Rocket },
  { id: "fintech", name: "FinTech", icon: DollarSign },
  { id: "medtech", name: "MedTech", icon: Heart },
  { id: "ecommerce", name: "E-commerce", icon: ShoppingCart },
  { id: "saas", name: "SaaS", icon: Cloud },
  { id: "industry40", name: "Industry 4.0", icon: Factory },
  { id: "automotive", name: "Automotive", icon: Car },
  { id: "proptech", name: "PropTech", icon: Home },
  { id: "energytech", name: "EnergyTech", icon: Zap },
  { id: "edtech", name: "EdTech", icon: BookOpen },
  { id: "agtech", name: "AgTech", icon: Sprout },
  { id: "cybersecurity", name: "CyberSecurity", icon: Shield },
]

interface SectorSelectorProps {
  selectedSectors: string[]
  onSectorsChange: (sectors: string[]) => void
}

export function SectorSelector({ selectedSectors, onSectorsChange }: SectorSelectorProps) {
  const toggleSector = (sectorId: string) => {
    if (selectedSectors.includes(sectorId)) {
      onSectorsChange(selectedSectors.filter((id) => id !== sectorId))
    } else {
      onSectorsChange([...selectedSectors, sectorId])
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {sectors.map((sector) => {
        const isSelected = selectedSectors.includes(sector.id)
        const IconComponent = sector.icon

        return (
          <div
            key={sector.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
              isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"
            }`}
            onClick={() => toggleSector(sector.id)}
          >
            <div className="flex flex-col items-center space-y-2 text-center">
              <IconComponent className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                {sector.name}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
