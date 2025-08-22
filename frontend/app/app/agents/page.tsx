import { AgentsPanel } from "@/components/app/agents-panel"
import { ActivityFeed } from "@/components/app/activity-feed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Clock, CheckCircle, AlertCircle } from "lucide-react"

const performanceMetrics = [
  { label: "Success Rate", value: 94.2, suffix: "%" },
  { label: "Avg. Speed", value: 2.3, suffix: " min/prospect" },
  { label: "Quality Score", value: 8.9, suffix: "/10" },
  { label: "Uptime", value: 99.8, suffix: "%" },
]

const taskQueue = [
  { id: "1", agent: "Market Researcher", task: "Analyze German automotive sector", priority: "high", eta: "15 min" },
  {
    id: "2",
    agent: "Prospecting Specialist",
    task: "Verify French fintech contacts",
    priority: "medium",
    eta: "30 min",
  },
  { id: "3", agent: "Content Writer", task: "Generate outreach templates", priority: "low", eta: "45 min" },
]

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Agents</h1>
        <p className="text-muted-foreground">Monitor and manage your AI agents in real-time</p>
      </div>

      {/* Agents Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentsPanel />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{metric.label}</span>
                <span className="font-semibold">
                  {metric.value}
                  {metric.suffix}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Task Queue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taskQueue.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {task.priority === "high" && <AlertCircle className="h-4 w-4 text-red-500" />}
                    {task.priority === "medium" && <Clock className="h-4 w-4 text-yellow-500" />}
                    {task.priority === "low" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <Badge
                      variant={
                        task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{task.agent}</p>
                    <p className="text-xs text-muted-foreground">{task.task}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">ETA: {task.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  )
}
