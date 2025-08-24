"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Copy, MessageSquare, Mail, Phone } from "lucide-react"

interface MessageTemplate {
  id: string
  name: string
  type: "email" | "linkedin" | "phone"
  category: "initial" | "follow_up" | "meeting_request" | "thank_you"
  subject?: string
  content: string
  variables: string[]
  usage_count: number
  success_rate: number
  created_at: string
}

const initialTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Email Initial - Tech Startup",
    type: "email",
    category: "initial",
    subject: "Optimisation de votre processus de prospection chez {{company_name}}",
    content: `Bonjour {{first_name}},

J'ai remarqué que {{company_name}} développe des solutions innovantes dans le secteur {{industry}}. 

En tant que {{job_title}}, vous cherchez probablement à optimiser vos processus de prospection pour accélérer votre croissance.

Notre plateforme d'IA a aidé des entreprises similaires à {{company_name}} à :
• Augmenter leur taux de conversion de 40%
• Réduire le temps de prospection de 60%
• Identifier des prospects qualifiés automatiquement

Seriez-vous disponible pour un échange de 15 minutes cette semaine ?

Cordialement,
{{sender_name}}`,
    variables: ["first_name", "company_name", "industry", "job_title", "sender_name"],
    usage_count: 45,
    success_rate: 18.5,
    created_at: "2024-01-15",
  },
  {
    id: "2",
    name: "LinkedIn - Follow-up",
    type: "linkedin",
    category: "follow_up",
    content: `Salut {{first_name}},

J'espère que vous allez bien ! Je vous avais contacté la semaine dernière concernant l'optimisation des processus de prospection chez {{company_name}}.

Je voulais partager avec vous une étude de cas récente : une entreprise de votre secteur a multiplié par 3 ses RDV qualifiés en utilisant notre solution IA.

Auriez-vous 10 minutes cette semaine pour en discuter ?

Bien à vous,
{{sender_name}}`,
    variables: ["first_name", "company_name", "sender_name"],
    usage_count: 32,
    success_rate: 22.1,
    created_at: "2024-01-18",
  },
  {
    id: "3",
    name: "Email - Demande RDV",
    type: "email",
    category: "meeting_request",
    subject: "Proposition de créneau - {{company_name}}",
    content: `Bonjour {{first_name}},

Suite à nos échanges, je vous propose quelques créneaux pour notre entretien :

• Mardi 15h-15h30
• Mercredi 10h-10h30  
• Jeudi 14h-14h30

L'objectif sera de vous présenter comment notre solution peut s'adapter spécifiquement aux besoins de {{company_name}} et répondre à vos questions.

Quel créneau vous convient le mieux ?

Cordialement,
{{sender_name}}`,
    variables: ["first_name", "company_name", "sender_name"],
    usage_count: 28,
    success_rate: 65.2,
    created_at: "2024-01-20",
  },
]

export function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const [formData, setFormData] = useState({
    name: "",
    type: "email" as "email" | "linkedin" | "phone",
    category: "initial" as "initial" | "follow_up" | "meeting_request" | "thank_you",
    subject: "",
    content: "",
    variables: [] as string[],
  })

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || template.type === filterType
    const matchesCategory = filterCategory === "all" || template.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "linkedin":
        return <MessageSquare className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "email":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "linkedin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "phone":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "initial":
        return "Premier contact"
      case "follow_up":
        return "Relance"
      case "meeting_request":
        return "Demande RDV"
      case "thank_you":
        return "Remerciement"
      default:
        return category
    }
  }

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g)
    return matches ? matches.map((match) => match.replace(/[{}]/g, "")) : []
  }

  const handleSaveTemplate = () => {
    const variables = extractVariables(formData.content + (formData.subject || ""))

    if (isEditing && selectedTemplate) {
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === selectedTemplate.id
            ? {
                ...template,
                ...formData,
                variables,
                usage_count: template.usage_count,
                success_rate: template.success_rate,
                created_at: template.created_at,
              }
            : template,
        ),
      )
    } else {
      const newTemplate: MessageTemplate = {
        id: Date.now().toString(),
        ...formData,
        variables,
        usage_count: 0,
        success_rate: 0,
        created_at: new Date().toISOString().split("T")[0],
      }
      setTemplates((prev) => [...prev, newTemplate])
    }

    // Reset form
    setFormData({
      name: "",
      type: "email",
      category: "initial",
      subject: "",
      content: "",
      variables: [],
    })
    setSelectedTemplate(null)
    setIsEditing(false)
  }

  const handleEditTemplate = (template: MessageTemplate) => {
    setFormData({
      name: template.name,
      type: template.type,
      category: template.category,
      subject: template.subject || "",
      content: template.content,
      variables: template.variables,
    })
    setSelectedTemplate(template)
    setIsEditing(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== templateId))
  }

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicatedTemplate: MessageTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copie)`,
      usage_count: 0,
      success_rate: 0,
      created_at: new Date().toISOString().split("T")[0],
    }
    setTemplates((prev) => [...prev, duplicatedTemplate])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Templates de Messages</h2>
          <p className="text-muted-foreground">Gérez vos modèles de messages pour la prospection</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Modifier le Template" : "Créer un Nouveau Template"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Email Initial - Tech Startup"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="phone">Téléphone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Premier contact</SelectItem>
                    <SelectItem value="follow_up">Relance</SelectItem>
                    <SelectItem value="meeting_request">Demande RDV</SelectItem>
                    <SelectItem value="thank_you">Remerciement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Objet (optionnel)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Objet de l'email"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="content">Contenu du message</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Utilisez {{variable}} pour les variables dynamiques"
                  rows={8}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: "",
                      type: "email",
                      category: "initial",
                      subject: "",
                      content: "",
                      variables: [],
                    })
                    setSelectedTemplate(null)
                    setIsEditing(false)
                  }}
                >
                  Annuler
                </Button>
                <Button onClick={handleSaveTemplate}>{isEditing ? "Modifier" : "Créer"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher un template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="phone">Téléphone</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            <SelectItem value="initial">Premier contact</SelectItem>
            <SelectItem value="follow_up">Relance</SelectItem>
            <SelectItem value="meeting_request">Demande RDV</SelectItem>
            <SelectItem value="thank_you">Remerciement</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getTypeColor(template.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(template.type)}
                        {template.type}
                      </div>
                    </Badge>
                    <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDuplicateTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEditTemplate(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteTemplate(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {template.subject && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Objet:</p>
                  <p className="text-sm bg-muted/50 p-2 rounded">{template.subject}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Contenu:</p>
                <div className="text-sm bg-muted/50 p-3 rounded max-h-32 overflow-y-auto">
                  {template.content.split("\n").map((line, index) => (
                    <p key={index} className={line.trim() === "" ? "h-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {template.variables.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Utilisé {template.usage_count} fois</span>
                  <span>•</span>
                  <span>Taux de succès: {template.success_rate}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Créé le {new Date(template.created_at).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun template trouvé</h3>
          <p className="text-muted-foreground">
            {searchTerm || filterType !== "all" || filterCategory !== "all"
              ? "Essayez de modifier vos filtres de recherche"
              : "Créez votre premier template de message"}
          </p>
        </div>
      )}
    </div>
  )
}
