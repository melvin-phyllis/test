"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface CrewAIProspect {
  id: string;
  company_name: string;
  contact_name?: string;
  contact_position?: string;
  email?: string;
  phone?: string;
  website?: string;
  sector: string;
  location: string;
  quality_score: number;
  status: string;
  description: string;
  extra_data?: {
    linkedin?: string;
    decision_makers?: string[];
    outreach_strategy?: string;
    contact_timeline?: string;
    source?: string;
    original_parser_failed?: boolean;
    extraction_timestamp?: string;
  };
  campaign_id: number;
  created_at: string;
  updated_at: string;
}

export interface CrewAIProspectsStats {
  total: number;
  qualified: number;
  identified: number;
  highScore: number;
  avgScore: number;
}

export function useCrewAIProspects(campaignId?: number) {
  const [prospects, setProspects] = useState<CrewAIProspect[]>([]);
  const [stats, setStats] = useState<CrewAIProspectsStats>({
    total: 0,
    qualified: 0,
    identified: 0,
    highScore: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrewAIProspects = async () => {
    try {
      setLoading(true);
      
      // Essayer de récupérer les prospects depuis l'API
      const apiUrls = [
        process.env.NEXT_PUBLIC_API_URL,
        'http://localhost:8000/api/v1',
        'http://192.168.1.69:8000/api/v1'
      ].filter(Boolean);
      
      let response = null;
      let lastError = null;
      
      for (const apiUrl of apiUrls) {
        try {
          console.log(`Trying to fetch CrewAI prospects from: ${apiUrl}`);
          
          // Essayer d'abord l'endpoint des prospects
          let endpoint = '/prospects/';
          if (campaignId) {
            endpoint += `?campaign_id=${campaignId}`;
          }
          
          response = await fetch(`${apiUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            console.log(`Successfully connected to: ${apiUrl}`);
            break;
          } else {
            console.log(`API ${apiUrl} returned status: ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`Failed to connect to ${apiUrl}:`, fetchError.message);
          lastError = fetchError;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('All API endpoints failed');
      }

      const data = await response.json();
      
      // Convertir les prospects de l'API en format CrewAI
      const crewAIProspects: CrewAIProspect[] = data.map((prospect: any) => ({
        id: prospect.id.toString(),
        company_name: prospect.company_name,
        contact_name: prospect.contact_name,
        contact_position: prospect.contact_position,
        email: prospect.email,
        phone: prospect.phone,
        website: prospect.website,
        sector: prospect.sector,
        location: prospect.location,
        quality_score: prospect.quality_score,
        status: prospect.status,
        description: prospect.description,
        extra_data: prospect.extra_data || {},
        campaign_id: prospect.campaign_id,
        created_at: prospect.created_at,
        updated_at: prospect.updated_at
      }));
      
      setProspects(crewAIProspects);
      
      // Calculer les statistiques
      const total = crewAIProspects.length;
      const qualified = crewAIProspects.filter(p => p.quality_score >= 80).length;
      const identified = crewAIProspects.filter(p => p.quality_score < 80).length;
      const highScore = crewAIProspects.filter(p => p.quality_score >= 90).length;
      const avgScore = total > 0 
        ? Math.round(crewAIProspects.reduce((sum, p) => sum + p.quality_score, 0) / total)
        : 0;
      
      setStats({ total, qualified, identified, highScore, avgScore });
      setError(null);
      
      console.log(`Successfully loaded ${total} CrewAI prospects`);
      
    } catch (err) {
      console.error('Error fetching CrewAI prospects:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      
      // Fallback vers des données de démo si l'API échoue
      const demoProspects: CrewAIProspect[] = [
        {
          id: "1",
          company_name: "BNP Paribas",
          contact_name: "Sophie Martin",
          contact_position: "Directrice Innovation",
          email: "sophie.martin@bnpparibas.com",
          phone: "+33 1 40 14 45 46",
          website: "bnpparibas.com",
          sector: "Finance",
          location: "France",
          quality_score: 85,
          status: "qualified",
          description: "Banque française leader en innovation digitale",
          extra_data: {
            linkedin: "linkedin.com/in/sophie-martin-bnp",
            decision_makers: ["Sophie Martin"],
            outreach_strategy: "Email personnalisé mettant en avant les réalisations de BNP en banque digitale",
            contact_timeline: "Contact initial par email (1ère semaine), suivi par email ou appel (2ème semaine)",
            source: "crewai_campaign_5",
            extraction_timestamp: new Date().toISOString()
          },
          campaign_id: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: "2",
          company_name: "Standard Bank",
          contact_name: "À déterminer",
          contact_position: "Contact à établir",
          email: "",
          phone: "",
          website: "standardbank.com",
          sector: "Finance",
          location: "Afrique du Sud",
          quality_score: 75,
          status: "identified",
          description: "Banque africaine majeure, contact à établir via LinkedIn",
          extra_data: {
            linkedin: "",
            decision_makers: [],
            outreach_strategy: "Utiliser la page LinkedIn de l'Afrique du Sud et suivre la correspondance standard",
            contact_timeline: "Contact initial via LinkedIn (1ère semaine), surveillance et engagement avec leurs posts (2ème semaine)",
            source: "crewai_campaign_5",
            extraction_timestamp: new Date().toISOString()
          },
          campaign_id: 5,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Filtrer par campagne si spécifiée
      const filteredProspects = campaignId 
        ? demoProspects.filter(p => p.campaign_id === campaignId)
        : demoProspects;
      
      setProspects(filteredProspects);
      
      const total = filteredProspects.length;
      const qualified = filteredProspects.filter(p => p.quality_score >= 80).length;
      const identified = filteredProspects.filter(p => p.quality_score < 80).length;
      const highScore = filteredProspects.filter(p => p.quality_score >= 90).length;
      const avgScore = total > 0 
        ? Math.round(filteredProspects.reduce((sum, p) => sum + p.quality_score, 0) / total)
        : 0;
      
      setStats({ total, qualified, identified, highScore, avgScore });
      
      console.log(`Using demo data: ${total} CrewAI prospects`);
    } finally {
      setLoading(false);
    }
  };

  const refreshProspects = async () => {
    await fetchCrewAIProspects();
    toast.success("Prospects CrewAI mis à jour");
  };

  useEffect(() => {
    // Délai pour éviter les problèmes d'hydratation
    const timer = setTimeout(() => {
      fetchCrewAIProspects();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [campaignId]);

  return {
    prospects,
    stats,
    loading,
    error,
    refreshProspects,
  };
}
