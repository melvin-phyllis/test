"use client"

import { BarChart3, Target, Users, TrendingUp, Settings, Globe } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const { t } = useI18n()

  const menuItems = [
    {
      title: t.nav.dashboard,
      url: "/app",
      icon: BarChart3,
    },
    {
      title: t.nav.campaigns,
      url: "/app/campaigns",
      icon: Target,
    },
    {
      title: t.nav.prospects,
      url: "/app/prospects",
      icon: Users,
    },
    {
      title: t.nav.agents,
      url: "/app/agents",
      icon: Globe,
    },
    {
      title: t.nav.analytics,
      url: "/app/analytics",
      icon: TrendingUp,
    },
    {
      title: t.nav.settings,
      url: "/app/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <Globe className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg">GlobalAI</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.url
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
