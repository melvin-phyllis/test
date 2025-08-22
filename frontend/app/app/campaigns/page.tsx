"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Eye, Pause, Play, Download, MoreHorizontal } from "lucide-react"
import { CampaignCreationModal } from "@/components/app/campaign-creation-modal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Campaign {
  id: string
  name: string
  countries: Array<{ flag: string; name: string }>
  sectors: string[]
  status: "running" | "completed" | "pending" | "paused"
  progress: number
  prospects: number
  createdAt: Date
}

const initialCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Tech Expansion Germany",
    countries: [{ flag: "🇩🇪", name: "Germany" }],
    sectors: ["Technology", "SaaS"],
    status: "running",
    progress: 67,
    prospects: 45,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "FinTech Canada",
    countries: [{ flag: "🇨🇦", name: "Canada" }],
    sectors: ["FinTech"],
    status: "completed",
    progress: 100,
    prospects: 28,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "SaaS UK",
    countries: [{ flag: "🇬🇧", name: "United Kingdom" }],
    sectors: ["SaaS", "Technology"],
    status: "pending",
    progress: 0,
    prospects: 0,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "4",
    name: "Industry 4.0 France",
    countries: [{ flag: "🇫🇷", name: "France" }],
    sectors: ["Industry 4.0", "Automotive"],
    status: "running",
    progress: 89,
    prospects: 67,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Running
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Pending
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Paused
          </Badge>
        )
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const handleCampaignCreate = (campaignData: any) => {
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignData.name,
      countries: campaignData.countries,
      sectors: campaignData.sectors.map((id: string) => {
        const sectorMap: Record<string, string> = {
          technology: "Technology",
          fintech: "FinTech",
          medtech: "MedTech",
          ecommerce: "E-commerce",
          saas: "SaaS",
          industry40: "Industry 4.0",
          automotive: "Automotive",
          proptech: "PropTech",
          energytech: "EnergyTech",
          edtech: "EdTech",
          agtech: "AgTech",
          cybersecurity: "CyberSecurity",
        }
        return sectorMap[id] || id
      }),
      status: "pending",
      progress: 0,
      prospects: 0,
      createdAt: new Date(),
    }
    setCampaigns([newCampaign, ...campaigns])
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your international prospecting campaigns</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {campaign.countries.map((country, index) => (
                      <span key={index} className="text-lg">
                        {country.flag}
                      </span>
                    ))}
                    <span className="text-sm text-muted-foreground">
                      {campaign.countries.map((c) => c.name).join(", ")}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {campaign.status === "running" ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause Campaign
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Campaign
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {campaign.sectors.slice(0, 2).map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
                {campaign.sectors.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.sectors.length - 2} more
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  {getStatusBadge(campaign.status)}
                  <span className="text-sm text-muted-foreground">{campaign.progress}%</span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prospects</span>
                <span className="font-medium">{campaign.prospects}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(campaign.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CampaignCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
