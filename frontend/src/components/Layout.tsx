import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Bot, 
  Menu, 
  X,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store'
import { clsx } from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campagnes', href: '/campaigns', icon: Target },
  { name: 'Prospects', href: '/prospects', icon: Users },
  { name: 'Agents', href: '/agents', icon: Bot },
]

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { isConnected } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={clsx(
        'fixed inset-0 z-40 flex lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                AI Agent Prospecting Platform
              </h1>
              
              <div className="flex items-center gap-x-4">
                {/* Connection status */}
                <div className={clsx(
                  'flex items-center gap-x-2 px-3 py-1 rounded-full text-sm',
                  isConnected 
                    ? 'bg-success-100 text-success-700' 
                    : 'bg-error-100 text-error-700'
                )}>
                  {isConnected ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  {isConnected ? 'Connecté' : 'Déconnecté'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )

  function SidebarContent() {
    return (
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
        <div className="flex h-16 shrink-0 items-center">
          <div className="flex items-center gap-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">AI Prospecting</span>
          </div>
        </div>
        
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={clsx(
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        )}
                      >
                        <item.icon
                          className={clsx(
                            'h-6 w-6 shrink-0',
                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    )
  }
}