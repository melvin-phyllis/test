"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Building, 
  Mail, 
  Phone, 
  Star, 
  MapPin, 
  Globe, 
  Linkedin, 
  User, 
  Briefcase,
  Calendar,
  Sparkles,
  ExternalLink
} from "lucide-react"
import { Prospect } from "@/hooks/use-prospects"

interface ProspectCardProps {
  prospect: Prospect
  onEnrich?: () => void
  onContact?: () => void
}

export function ProspectCard({ prospect, onEnrich, onContact }: ProspectCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusVariant = (status: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'identified': 'secondary',
      'qualified': 'default',
      'contacted': 'outline',
      'interested': 'outline',
      'converted': 'default',
      'rejected': 'destructive',
    };
    return variantMap[status] || 'secondary';
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'identified': 'Identifié',
      'qualified': 'Qualifié',
      'contacted': 'Contacté',
      'interested': 'Intéressé',
      'converted': 'Converti',
      'rejected': 'Rejeté',
    };
    return statusMap[status] || status;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-lg font-semibold">
                {prospect.contact_name
                  ? prospect.contact_name.split(" ").map((n) => n[0]).join("")
                  : prospect.company_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {prospect.contact_name || "Contact à définir"}
              </CardTitle>
              <CardDescription className="text-base">
                {prospect.contact_position || "Poste à définir"}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={getStatusVariant(prospect.status)}>
              {getStatusLabel(prospect.status)}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${getScoreColor(prospect.quality_score)}`} />
              <span className={`text-sm font-medium ${getScoreColor(prospect.quality_score)}`}>
                {prospect.quality_score}/100
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Company Information */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-lg">{prospect.company_name}</span>
          </div>
          
          {prospect.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {prospect.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {prospect.sector && (
              <Badge variant="outline" className="text-xs">
                {prospect.sector}
              </Badge>
            )}
            {prospect.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {prospect.location}
              </Badge>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Informations de Contact
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prospect.email && (
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                <Mail className="w-4 h-4 text-green-600" />
                <a 
                  href={`mailto:${prospect.email}`} 
                  className="text-sm text-primary hover:underline flex-1"
                >
                  {prospect.email}
                </a>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}

            {prospect.phone && (
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                <Phone className="w-4 h-4 text-blue-600" />
                <a 
                  href={`tel:${prospect.phone}`} 
                  className="text-sm text-primary hover:underline flex-1"
                >
                  {prospect.phone}
                </a>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}

            {prospect.website && (
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                <Globe className="w-4 h-4 text-purple-600" />
                <a 
                  href={prospect.website.startsWith('http') ? prospect.website : `https://${prospect.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex-1"
                >
                  {prospect.website}
                </a>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}

            {prospect.extra_data?.linkedin && (
              <div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <a 
                  href={prospect.extra_data.linkedin}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex-1"
                >
                  Profil LinkedIn
                </a>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Missing Contact Info */}
          {!prospect.email && !prospect.phone && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Informations de contact à compléter</span>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Information */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Informations de Campagne
          </h4>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Campagne #{prospect.campaign_id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Ajouté le {new Date(prospect.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-2">
            {onEnrich && (
              <Button variant="outline" size="sm" onClick={onEnrich}>
                <Sparkles className="w-3 h-3 mr-2" />
                Enrichir
              </Button>
            )}
            {onContact && (
              <Button variant="outline" size="sm" onClick={onContact}>
                <Mail className="w-3 h-3 mr-2" />
                Contacter
              </Button>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground">
            Dernière mise à jour: {new Date(prospect.updated_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
