"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification = { ...notification, id }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove after duration
    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration || 5000)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
          index={index}
        />
      ))}
    </div>
  )
}

function NotificationItem({
  notification,
  onRemove,
  index
}: {
  notification: Notification
  onRemove: () => void
  index: number
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), index * 100)
  }, [index])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(onRemove, 300)
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'error':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  return (
    <div
      className={`
        notification-enhanced glass-effect rounded-lg p-4 shadow-lg border-l-4 
        transform transition-all duration-300 ease-out
        ${getColorClasses()}
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isRemoving ? 'scale-95 opacity-0' : ''}
        hover:scale-105 hover:shadow-xl
        max-w-sm
      `}
      style={{
        animationDelay: `${index * 100}ms`
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 animate-scale-in">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 animate-slide-in-left">
              {notification.title}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full opacity-70 hover:opacity-100 transition-all duration-200"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {notification.message && (
            <p className="text-sm text-gray-600 dark:text-gray-300 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              {notification.message}
            </p>
          )}

          {notification.action && (
            <div className="mt-3 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="hover-lift magnetic-hover"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-current opacity-50 animate-progress"
            style={{
              animation: `progress ${notification.duration}ms linear`,
              animationDelay: `${index * 100}ms`
            }}
          />
        </div>
      )}
    </div>
  )
}

// Helper hook for common notification types
export function useNotificationHelpers() {
  const { addNotification } = useNotifications()

  return {
    success: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'success', title, message, action }),

    error: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'error', title, message, action, duration: 0 }),

    warning: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'warning', title, message, action }),

    info: (title: string, message?: string, action?: Notification['action']) =>
      addNotification({ type: 'info', title, message, action }),
  }
}

// Add the progress animation to CSS
const progressAnimation = `
@keyframes progress {
  from { width: 100%; }
  to { width: 0%; }
}
`

// Inject the animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = progressAnimation
  document.head.appendChild(style)
}