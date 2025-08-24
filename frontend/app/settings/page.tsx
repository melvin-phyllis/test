"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Bot,
  Bell,
  Shield,
  Zap,
  Globe,
  Mail,
  Phone,
  Key,
  Database,
  Webhook,
  Save,
  Upload,
  Trash2,
} from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    campaigns: true,
    prospects: false,
    agents: true,
  })

  const [aiSettings, setAiSettings] = useState({
    aggressiveness: "medium",
    language: "fr",
    tone: "professional",
    followUpDelay: "24",
    maxProspects: "100",
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Paramètres</h1>
          <p className="text-muted-foreground">Configurez votre plateforme de prospection IA</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            IA
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Intégrations
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>Gérez vos informations de profil et préférences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/professional-woman-diverse.png" />
                  <AvatarFallback>SL</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Changer la photo
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" defaultValue="Sophie" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" defaultValue="Laurent" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="sophie.laurent@example.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" defaultValue="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise</Label>
                  <Input id="company" defaultValue="ProspectAI Solutions" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Décrivez votre activité..."
                  defaultValue="Experte en prospection B2B avec 8 ans d'expérience dans le développement commercial."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Configuration IA
              </CardTitle>
              <CardDescription>Personnalisez le comportement de vos agents IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aggressiveness">Niveau d'agressivité</Label>
                  <Select
                    value={aiSettings.aggressiveness}
                    onValueChange={(value) => setAiSettings((prev) => ({ ...prev, aggressiveness: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible - Approche douce</SelectItem>
                      <SelectItem value="medium">Moyen - Équilibré</SelectItem>
                      <SelectItem value="high">Élevé - Persistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Langue principale</Label>
                  <Select
                    value={aiSettings.language}
                    onValueChange={(value) => setAiSettings((prev) => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">Anglais</SelectItem>
                      <SelectItem value="es">Espagnol</SelectItem>
                      <SelectItem value="de">Allemand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone">Ton de communication</Label>
                  <Select
                    value={aiSettings.tone}
                    onValueChange={(value) => setAiSettings((prev) => ({ ...prev, tone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professionnel</SelectItem>
                      <SelectItem value="friendly">Amical</SelectItem>
                      <SelectItem value="casual">Décontracté</SelectItem>
                      <SelectItem value="formal">Formel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpDelay">Délai de relance (heures)</Label>
                  <Input
                    id="followUpDelay"
                    type="number"
                    value={aiSettings.followUpDelay}
                    onChange={(e) => setAiSettings((prev) => ({ ...prev, followUpDelay: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxProspects">Prospects max par jour</Label>
                <Input
                  id="maxProspects"
                  type="number"
                  value={aiSettings.maxProspects}
                  onChange={(e) => setAiSettings((prev) => ({ ...prev, maxProspects: e.target.value }))}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Fonctionnalités avancées</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-qualification des prospects</Label>
                      <p className="text-sm text-muted-foreground">
                        L'IA qualifie automatiquement les prospects selon vos critères
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Personnalisation automatique</Label>
                      <p className="text-sm text-muted-foreground">
                        Messages personnalisés basés sur le profil LinkedIn
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analyse de sentiment</Label>
                      <p className="text-sm text-muted-foreground">Analyse les réponses pour adapter la stratégie</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Préférences de notification
              </CardTitle>
              <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Canaux de notification</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4" />
                      <div>
                        <Label>Email</Label>
                        <p className="text-sm text-muted-foreground">Notifications par email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4 h-4" />
                      <div>
                        <Label>Push</Label>
                        <p className="text-sm text-muted-foreground">Notifications push dans le navigateur</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, push: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4" />
                      <div>
                        <Label>SMS</Label>
                        <p className="text-sm text-muted-foreground">Notifications par SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Types de notification</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Campagnes</Label>
                      <p className="text-sm text-muted-foreground">Début, fin et résultats de campagnes</p>
                    </div>
                    <Switch
                      checked={notifications.campaigns}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, campaigns: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Nouveaux prospects</Label>
                      <p className="text-sm text-muted-foreground">Prospects qualifiés et réponses reçues</p>
                    </div>
                    <Switch
                      checked={notifications.prospects}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, prospects: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Agents IA</Label>
                      <p className="text-sm text-muted-foreground">Statut et performances des agents</p>
                    </div>
                    <Switch
                      checked={notifications.agents}
                      onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, agents: checked }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Intégrations
              </CardTitle>
              <CardDescription>Connectez vos outils et services préférés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">LinkedIn Sales Navigator</h4>
                      <p className="text-sm text-muted-foreground">Prospection avancée sur LinkedIn</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Connecté
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Gmail</h4>
                      <p className="text-sm text-muted-foreground">Envoi d'emails automatisé</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Connecté
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">HubSpot CRM</h4>
                      <p className="text-sm text-muted-foreground">Synchronisation des contacts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Non connecté</Badge>
                    <Button size="sm">Connecter</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Webhook className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Zapier</h4>
                      <p className="text-sm text-muted-foreground">Automatisation avec 5000+ apps</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Non connecté</Badge>
                    <Button size="sm">Connecter</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">API & Webhooks</h4>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Clé API</Label>
                  <div className="flex gap-2">
                    <Input id="apiKey" type="password" defaultValue="sk-proj-abc123..." readOnly />
                    <Button variant="outline" size="sm">
                      <Key className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL Webhook</Label>
                  <Input id="webhookUrl" placeholder="https://votre-site.com/webhook" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité
              </CardTitle>
              <CardDescription>Protégez votre compte et vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Mot de passe</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Changer le mot de passe</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Authentification à deux facteurs</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>2FA activée</Label>
                    <p className="text-sm text-muted-foreground">Protection supplémentaire pour votre compte</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="outline">Configurer l'authentificateur</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Sessions actives</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Session actuelle</p>
                      <p className="text-sm text-muted-foreground">Paris, France • Chrome sur Windows</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Actuelle
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">iPhone</p>
                      <p className="text-sm text-muted-foreground">Lyon, France • Safari sur iOS</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Déconnecter
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Données et confidentialité</h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Télécharger mes données
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive bg-transparent">
                    Supprimer mon compte
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
