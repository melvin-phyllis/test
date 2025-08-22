import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Campaigns from '@/pages/Campaigns'
import CampaignDetail from '@/pages/CampaignDetail'
import Prospects from '@/pages/Prospects'
import Agents from '@/pages/Agents'
import { wsService } from '@/services/websocket'
import { useAppStore } from '@/store'

function App() {
  const { setWebSocketConnected, setLastMessage } = useAppStore()

  useEffect(() => {
    // Initialize WebSocket connection
    wsService.connect()

    // Subscribe to connection status
    const unsubscribe = wsService.subscribe('*', (message) => {
      setLastMessage(message)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      wsService.disconnect()
    }
  }, [setWebSocketConnected, setLastMessage])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route path="/prospects" element={<Prospects />} />
        <Route path="/agents" element={<Agents />} />
      </Routes>
    </Layout>
  )
}

export default App