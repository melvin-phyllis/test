"use client"

import { useState } from "react"
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Bot,
  Zap,
  Activity,
  Users,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useProspectNotifications, useWebSocketConnection } from "@/hooks/use-realtime"

export function AppHeader() {
  const { user, isAdmin, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useProspectNotifications()
  const { isConnected } = useWebSocketConnection()
  const [showNotifications, setShowNotifications] = useState(false)

  if (!user) return null

  const userInitials = user.name 
    ? user.name.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diff < 60) return `${diff}s`
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    return `${Math.floor(diff / 3600)}h`
  }

  return (
    <header className="border-b border-border bg-white shadow-sm sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {/* Indicateur de connexion WebSocket */}
          <div className={cn(
            "flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-all",
            isConnected 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          )}>
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Temps Réel</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnecté</span>
              </>
            )}
          </div>

          {/* Stats rapides */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 text-blue-500" />
              <span>Agents IA</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4 text-green-500" />
              <span>Actifs</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Actions rapides */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/app/campaigns">
                <Target className="h-4 w-4 mr-2" />
                Nouvelle Campagne
              </a>
            </Button>
          </div>

          {/* Notifications temps réel */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hover:bg-muted"
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) markAsRead()
                }}
              >
                <Bell className={cn(
                  "h-5 w-5 transition-colors",
                  unreadCount > 0 ? "text-orange-500" : "text-muted-foreground"
                )} />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white px-1 min-w-[20px] h-5 flex items-center justify-center text-xs animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications Prospects</span>
                {unreadCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <ScrollArea className="max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Aucune notification</p>
                    <p className="text-xs">Les nouveaux prospects apparaîtront ici</p>
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <DropdownMenuItem key={notification.id} className="p-0">
                      <div className="w-full p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span className="font-medium text-sm">Nouveau prospect qualifié</span>
                            </div>
                            <p className="text-sm font-semibold">{notification.prospect.company_name}</p>
                            {notification.prospect.contact_name && (
                              <p className="text-xs text-muted-foreground">{notification.prospect.contact_name}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Score: {notification.prospect.quality_score}%
                              </Badge>
                              <Badge variant="outline" className="text-xs text-green-600">
                                {notification.agent_name}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </ScrollArea>
              
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center">
                    <Button variant="ghost" size="sm" className="w-full">
                      Voir tous les prospects
                    </Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 border-2 border-blue-200">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <Zap className="h-2 w-2 text-white" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {isAdmin && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs w-fit">
                      Administrateur
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
