import type React from "react"
import { AppSidebar } from "@/components/app/app-sidebar"
import { AppHeader } from "@/components/app/app-header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { WebSocketProvider } from "@/components/app/websocket-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/error-boundary"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <WebSocketProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader />
              <ErrorBoundary>
                <main className="flex-1 p-6 bg-background">{children}</main>
              </ErrorBoundary>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      </WebSocketProvider>
    </ErrorBoundary>
  )
}
