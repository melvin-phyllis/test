import { RealTimeKpiCards } from "@/components/app/real-time-kpi-cards"
import { WorldMapDashboard } from "@/components/app/world-map-dashboard"
import { RealTimeAgentsPanel } from "@/components/app/real-time-agents-panel"
import { ActivityFeed } from "@/components/app/activity-feed"
import { CampaignsTable } from "@/components/app/campaigns-table"

export default function AppDashboard() {
  return (
    <div className="space-y-6">
      <RealTimeKpiCards />

      {/* Map and Agents Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WorldMapDashboard />
        </div>
        <div className="lg:col-span-1">
          <RealTimeAgentsPanel />
        </div>
      </div>

      {/* Activity Feed Row */}
      <ActivityFeed />

      {/* Campaigns Table Row */}
      <CampaignsTable />
    </div>
  )
}
