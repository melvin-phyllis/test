"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  BarChart3,
  Users,
  Target,
  Zap,
  Settings,
  Shield,
  Home,
  Activity,
  Bell,
  LogOut,
  Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useProspectNotifications } from "@/hooks/use-realtime"

const navigation = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: Home,
    description: "Vue d'ensemble temps réel"
  },
  {
    title: "Campagnes",
    url: "/app/campaigns",
    icon: Target,
    description: "Gérer vos campagnes"
  },
  {
    title: "Agents IA",
    url: "/app/agents",
    icon: Bot,
    description: "Monitoring des agents"
  },
  {
    title: "Analytics",
    url: "/app/analytics", 
    icon: BarChart3,
    description: "Analyses géographiques"
  },
  {
    title: "Prospects",
    url: "/app/prospects",
    icon: Users,
    description: "Base de prospects"
  }
]

const adminNavigation = [
  {
    title: "Administration",
    url: "/app/admin",
    icon: Shield,
    description: "Panneau admin"
  },
  {
    title: "Paramètres",
    url: "/app/settings",
    icon: Settings,
    description: "Configuration système"
  }
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth()
  const { unreadCount } = useProspectNotifications()

  if (!user) return null

  const userInitials = user.name 
    ? user.name.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-border shadow-sm">
      {/* Header */}
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CrewAI Prospector
            </span>
            <span className="text-xs text-muted-foreground">
              Prospection IA
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-6">
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Navigation
          </h3>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.url
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md" 
                      : "text-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    <span>{item.title}</span>
                  </div>
                  {item.title === "Dashboard" && unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white px-1 min-w-[20px] h-5 flex items-center justify-center text-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {isAdmin && (
          <>
            <Separator />
            <div>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Administration
              </h3>
              <nav className="space-y-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                        isActive 
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md" 
                          : "text-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span>{item.title}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </>
        )}

        <Separator />
        
        {/* Actions rapides */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Actions Rapides
          </h3>
          <nav className="space-y-1">
            <Link
              href="/app/campaigns"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Nouvelle Campagne</span>
            </Link>
            <Link
              href="/app/dashboard"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 group"
            >
              <Activity className="h-4 w-4 text-blue-500" />
              <span>Activité Temps Réel</span>
            </Link>
            {unreadCount > 0 && (
              <Link
                href="/app/dashboard"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <span>Notifications</span>
                </div>
                <Badge className="bg-red-500 text-white px-1 min-w-[20px] h-5 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Footer avec profil utilisateur */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-muted/50 mb-3">
          <Avatar className="h-8 w-8 border-2 border-blue-200">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          {isAdmin && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              Admin
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={logout} 
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
