"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bot, Rocket, Target, Users, Building, Globe, Loader2, CheckCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Task {
  id: string
  name: string
  description: string
  status: "pending" | "running" | "completed" | "failed"
  agent: string
  progress: number
  results?: number
  startTime?: string
}

export default function AITaskLauncher() {
  const [selectedAgent, setSelectedAgent] = useState("")
  const [taskType, setTaskType] = useState("prospect-search")
  const [taskConfig, setTaskConfig] = useState({
    query: "",
    maxResults: "50",
    filters: {
      industry: "",
      location: "",
      companySize: "",
      jobTitle: "",
    },
  })
  const [isLaunching, setIsLaunching] = useState(false)
  const [activeTasks, setActiveTasks] = useState<Task[]>([])

  const agents = [
    {
      id: "prospector",
      name: "Prospecteur Principal",
      description: "Recherche avancée avec Serper + LinkedIn",
      avatar: "/blue-ai-robot.png",
      capabilities: ["Recherche Google", "Scraping LinkedIn", "Enrichissement email"],
      status: "active",
    },
    {
      id: "qualifier",
      name: "Qualificateur Expert",
      description: "Scoring et qualification automatique",
      avatar: "/ai-robot-green.png",
      capabilities: ["Scoring ICP", "Analyse de profil", "Validation données"],
      status: "active",
    },
    {
      id: "analyzer",
      name: "Analyseur de Marché",
      description: "Intelligence marché et veille concurrentielle",
      avatar: "/ai-robot-orange.png",
      capabilities: ["Analyse marché", "Veille concurrentielle", "Tendances secteur"],
      status: "active",
    },
  ]

  const taskTypes = [
    {
      id: "prospect-search",
      name: "Recherche de prospects",
      description: "Trouver de nouveaux prospects qualifiés",
      icon: Users,
      estimatedTime: "5-15 min",
    },
    {
      id: "company-research",
      name: "Recherche d'entreprises",
      description: "Analyser des entreprises cibles",
      icon: Building,
      estimatedTime: "10-20 min",
    },
    {
      id: "market-analysis",
      name: "Analyse de marché",
      description: "Étudier un secteur ou une niche",
      icon: Globe,
      estimatedTime: "15-30 min",
    },
    {
      id: "lead-enrichment",
      name: "Enrichissement de leads",
      description: "Compléter les données existantes",
      icon: Target,
      estimatedTime: "2-5 min",
    },
  ]

  const handleLaunchTask = async () => {
    if (!selectedAgent || !taskConfig.query.trim()) return

    setIsLaunching(true)

    // Simulation du lancement de tâche
    const newTask: Task = {
      id: Date.now().toString(),
      name: taskTypes.find((t) => t.id === taskType)?.name || "Tâche IA",
      description: taskConfig.query,
      status: "running",
      agent: agents.find((a) => a.id === selectedAgent)?.name || "Agent IA",
      progress: 0,
      startTime: new Date().toLocaleTimeString(),
    }

    setActiveTasks((prev) => [newTask, ...prev])

    // Simulation de progression
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setActiveTasks((prev) =>
          prev.map((task) =>
            task.id === newTask.id
              ? { ...task, status: "completed", progress: 100, results: Math.floor(Math.random() * 50) + 10 }
              : task,
          ),
        )
      } else {
        setActiveTasks((prev) => prev.map((task) => (task.id === newTask.id ? { ...task, progress } : task)))
      }
    }, 500)

    setTimeout(() => {
      setIsLaunching(false)
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-blue-600 bg-blue-50"
      case "completed":
        return "text-green-600 bg-green-50"
      case "failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "failed":
        return <Target className="w-4 h-4" />
      default:
        return <Bot className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Lanceur de Tâches IA
          </CardTitle>
          <CardDescription>Configurez et lancez des tâches automatisées avec vos agents IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agent Selection */}
          <div className="space-y-3">
            <Label>Sélectionner un agent</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedAgent === agent.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Bot className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{agent.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{agent.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 2).map((cap, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {agent.status === "active" && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Task Type Selection */}
          <div className="space-y-3">
            <Label>Type de tâche</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {taskTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    taskType === type.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setTaskType(type.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <type.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{type.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{type.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {type.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Task Configuration */}
          <div className="space-y-4">
            <Label>Configuration de la tâche</Label>
            <Textarea
              placeholder="Décrivez précisément ce que vous voulez que l'agent fasse..."
              value={taskConfig.query}
              onChange={(e) => setTaskConfig({ ...taskConfig, query: e.target.value })}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre de résultats max</Label>
                <Select
                  value={taskConfig.maxResults}
                  onValueChange={(value) => setTaskConfig({ ...taskConfig, maxResults: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 résultats</SelectItem>
                    <SelectItem value="50">50 résultats</SelectItem>
                    <SelectItem value="100">100 résultats</SelectItem>
                    <SelectItem value="200">200 résultats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <Button
            onClick={handleLaunchTask}
            disabled={!selectedAgent || !taskConfig.query.trim() || isLaunching}
            className="w-full animate-pulse-glow"
            size="lg"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Lancement en cours...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Lancer la tâche IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Tâches en cours ({activeTasks.length})</CardTitle>
            <CardDescription>Suivi en temps réel de vos agents IA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeTasks.map((task) => (
              <Card key={task.id} className="border-border/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getStatusIcon(task.status)}
                      </div>
                      <div>
                        <h3 className="font-medium">{task.name}</h3>
                        <p className="text-sm text-muted-foreground">par {task.agent}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status === "running"
                          ? "En cours"
                          : task.status === "completed"
                            ? "Terminé"
                            : task.status === "failed"
                              ? "Échec"
                              : "En attente"}
                      </Badge>
                      {task.results && (
                        <Badge variant="outline" className="bg-green-50 text-green-600">
                          {task.results} résultats
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>

                  {task.status === "running" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progression</span>
                        <span>{Math.round(task.progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {task.startTime && <p className="text-xs text-muted-foreground mt-2">Démarré à {task.startTime}</p>}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
