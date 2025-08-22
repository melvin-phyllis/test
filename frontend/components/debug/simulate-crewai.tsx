"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { wsService } from "@/lib/websocket"
import { Bot, Users, Target, Activity } from "lucide-react"

export function SimulateCrewAI() {
  const simulateAgentStart = () => {
    const agentNames = [
      'Global Market Researcher',
      'Global Business Search',
      'Data Analysis Agent',
      'Quality Assessment Agent',
      'Lead Validation Agent'
    ]
    
    const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)]
    
    // Simuler le message comme s'il venait du backend
    const message = {
      type: 'agent_activity',
      data: {
        id: Date.now(),
        agent_name: randomAgent,
        task_name: 'Recherche de prospects',
        message: `${randomAgent} démarre la recherche dans le secteur technologique`,
        status: 'working',
        campaign_id: 1,
        started_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    // Injecter directement le message dans le WebSocket
    wsService['notifySubscribers'](message.type, message)
  }

  const simulateAgentProgress = () => {
    const agentNames = [
      'Global Market Researcher',
      'Global Business Search', 
      'Data Analysis Agent'
    ]
    
    const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)]
    const progress = Math.floor(Math.random() * 80) + 10
    
    const message = {
      type: 'agent_activity',
      data: {
        id: Date.now(),
        agent_name: randomAgent,
        task_name: 'Analyse en cours',
        message: `${randomAgent} analyse ${progress} entreprises trouvées...`,
        status: 'working',
        campaign_id: 1,
        progress: progress,
        started_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    wsService['notifySubscribers'](message.type, message)
  }

  const simulateAgentComplete = () => {
    const agentNames = [
      'Global Market Researcher',
      'Global Business Search',
      'Quality Assessment Agent'
    ]
    
    const randomAgent = agentNames[Math.floor(Math.random() * agentNames.length)]
    
    const message = {
      type: 'agent_activity',
      data: {
        id: Date.now(),
        agent_name: randomAgent,
        task_name: 'Analyse terminée',
        message: `${randomAgent} a terminé l'analyse avec succès`,
        status: 'completed',
        campaign_id: 1,
        result: 'Analyse terminée avec succès - 25 prospects qualifiés trouvés',
        started_at: new Date(Date.now() - 120000).toISOString(), // Il y a 2 minutes
        completed_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    wsService['notifySubscribers'](message.type, message)
  }

  const simulateProspectFound = () => {
    const companies = [
      { name: 'TechStart Solutions', sector: 'Technologie', location: 'Paris, France' },
      { name: 'InnovateCorp', sector: 'Intelligence Artificielle', location: 'Lyon, France' },
      { name: 'DataFlow Systems', sector: 'Big Data', location: 'Marseille, France' },
      { name: 'CloudNine Analytics', sector: 'Cloud Computing', location: 'Toulouse, France' },
      { name: 'QuantumTech Ltd', sector: 'Quantum Computing', location: 'Nice, France' }
    ]
    
    const randomCompany = companies[Math.floor(Math.random() * companies.length)]
    const qualityScore = Math.floor(Math.random() * 30) + 70 // Score entre 70-100%
    
    const message = {
      type: 'prospect_found',
      data: {
        id: `prospect-${Date.now()}`,
        prospect: {
          company_name: randomCompany.name,
          contact_name: `Directeur ${randomCompany.name}`,
          email: `contact@${randomCompany.name.toLowerCase().replace(/\s+/g, '')}.fr`,
          quality_score: qualityScore,
          sector: randomCompany.sector,
          location: randomCompany.location
        },
        campaign_id: 1,
        campaign_name: 'Prospection Tech France',
        timestamp: new Date().toISOString(),
        agent_name: 'Global Business Search'
      },
      timestamp: new Date().toISOString()
    }
    
    wsService['notifySubscribers'](message.type, message)
  }

  const simulateCrewAISession = () => {
    // Séquence complète d'une session CrewAI
    setTimeout(() => simulateAgentStart(), 0)
    setTimeout(() => simulateAgentProgress(), 2000)
    setTimeout(() => simulateAgentProgress(), 4000)
    setTimeout(() => simulateProspectFound(), 5000)
    setTimeout(() => simulateAgentProgress(), 6000)
    setTimeout(() => simulateProspectFound(), 8000)
    setTimeout(() => simulateAgentComplete(), 10000)
  }

  const simulateError = () => {
    const message = {
      type: 'agent_activity',
      data: {
        id: Date.now(),
        agent_name: 'Global Market Researcher',
        task_name: 'Erreur de connexion',
        message: 'Erreur lors de la connexion à l\'API externe',
        status: 'error',
        campaign_id: 1,
        error_message: 'Timeout de connexion à l\'API de recherche',
        started_at: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }
    
    wsService['notifySubscribers'](message.type, message)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-purple-500" />
          <span>Simulateur CrewAI</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateAgentStart}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4 text-blue-500" />
            <span>Agent Démarre</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateAgentProgress}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4 text-yellow-500" />
            <span>Agent Progresse</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateAgentComplete}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4 text-green-500" />
            <span>Agent Termine</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateProspectFound}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4 text-purple-500" />
            <span>Prospect Trouvé</span>
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={simulateError}
            className="flex items-center space-x-2"
          >
            <Activity className="h-4 w-4 text-red-500" />
            <span>Erreur Agent</span>
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={simulateCrewAISession}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500"
          >
            <Target className="h-4 w-4" />
            <span>Session Complète</span>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Ces boutons simulent les messages CrewAI que le backend devrait envoyer en temps réel.
          Utilisez-les pour tester l'affichage des actions d'agents dans le dashboard.
        </p>
      </CardContent>
    </Card>
  )
}