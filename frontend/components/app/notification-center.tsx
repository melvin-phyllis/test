"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle, AlertCircle, Users, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "prospect" | "campaign" | "agent" | "system"
  title: string
  message: string
  timestamp: Date
  read: boolean
  agentName?: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const notificationTypes = [
        {
          type: "prospect" as const,
          title: "Nouveau prospect qualifié",
          message: "Agent Prospecteur a trouvé un prospect avec un score de 95%",
          agentName: "Agent Prospecteur",
        },
        {
          type: "campaign" as const,
          title: "Campagne terminée",
          message: 'La campagne "Tech Startups" a généré 12 nouveaux prospects',
        },
        {
          type: "agent" as const,
          title: "Agent en action",
          message: "Agent Analyste analyse les profils LinkedIn...",
          agentName: "Agent Analyste",
        },
      ]

      if (Math.random() > 0.7) {
        // 30% chance every 5 seconds
        const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotif,
          timestamp: new Date(),
          read: false,
        }

        setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]) // Keep only 10 notifications
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "prospect":
        return <Users className="w-4 h-4 text-blue-500" />
      case "campaign":
        return <Target className="w-4 h-4 text-green-500" />
      case "agent":
        return <CheckCircle className="w-4 h-4 text-purple-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    return date.toLocaleDateString()
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">Aucune notification</div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 cursor-pointer border-l-2 ${
                    notification.read ? "border-transparent opacity-60" : "border-blue-500 bg-blue-50/50"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <span className="text-xs text-muted-foreground">{formatTime(notification.timestamp)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      {notification.agentName && (
                        <Badge variant="outline" className="text-xs">
                          {notification.agentName}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
