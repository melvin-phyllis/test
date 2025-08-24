"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface Prospect {
  id: number;
  campaign_id: number;
  company_name: string;
  website: string;
  description: string;
  sector: string;
  location: string;
  contact_name: string | null;
  contact_position: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  quality_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  extra_data?: any;
}

export interface ProspectsStats {
  total: number;
  qualified: number;
  contacted: number;
  avgScore: number;
}

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [stats, setStats] = useState<ProspectsStats>({
    total: 0,
    qualified: 0,
    contacted: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProspects = async () => {
    try {
      setLoading(true);
      // Try multiple API URLs
      const apiUrls = [
        process.env.NEXT_PUBLIC_API_URL,
        'http://192.168.1.69:8000/api/v1',
        'http://localhost:8000/api/v1'
      ].filter(Boolean);
      
      let response = null;
      let lastError = null;
      
      for (const apiUrl of apiUrls) {
        try {
          console.log(`Trying API URL: ${apiUrl}`);
          response = await fetch(`${apiUrl}/prospects/?limit=100`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          
          if (response.ok) {
            console.log(`Successfully connected to: ${apiUrl}`);
            break; // Success, exit loop
          } else {
            console.log(`API ${apiUrl} returned status: ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`Failed to connect to ${apiUrl}:`, fetchError.message);
          lastError = fetchError;
          continue; // Try next URL
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('All API endpoints failed');
      }

      const data = await response.json();
      setProspects(data);
      
      // Calculer les statistiques
      const total = data.length;
      const qualified = data.filter((p: Prospect) => p.quality_score >= 80).length;
      const contacted = data.filter((p: Prospect) => 
        p.status === 'contacted' || p.status === 'qualified'
      ).length;
      const avgScore = total > 0 
        ? Math.round(data.reduce((sum: number, p: Prospect) => sum + p.quality_score, 0) / total * 10) / 10
        : 0;
      
      setStats({ total, qualified, contacted, avgScore });
      setError(null);
    } catch (err) {
      console.error('Error fetching prospects:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      
      // Fallback vers des données de démo CrewAI en cas d'erreur
      const demoProspects: Prospect[] = [
        {
          id: 1,
          campaign_id: 1,
          company_name: "Farfetch",
          website: "https://www.farfetch.com/",
          description: "Plateforme e-commerce de luxe internationale avec marketplace fashion",
          sector: "E-commerce/Luxury Fashion",
          location: "International",
          contact_name: "Joshua Dent",
          contact_position: "Decision Maker",
          email: "customercare@farfetch.com",
          phone: "(646) 791-3768",
          whatsapp: null,
          quality_score: 95,
          status: "qualified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          extra_data: {
            decision_makers: ["Joshua Dent", "Christine Mou"],
            linkedin_profiles: ["https://www.linkedin.com/company/farfetch.com"]
          }
        },
        {
          id: 2,
          campaign_id: 1,
          company_name: "Mytheresa",
          website: "https://www.mytheresa.com/",
          description: "E-commerce premium de mode de luxe",
          sector: "E-commerce/Luxury Fashion",
          location: "International",
          contact_name: "Aaron Alexander",
          contact_position: "Decision Maker",
          email: null,
          phone: "1-888-550-9675",
          whatsapp: null,
          quality_score: 90,
          status: "qualified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          extra_data: {
            decision_makers: ["Aaron Alexander", "Jessica Amodio"],
            linkedin_profiles: ["https://www.linkedin.com/company/mytheresa-com"]
          }
        },
        {
          id: 3,
          campaign_id: 1,
          company_name: "Net-a-Porter",
          website: "https://www.net-a-porter.com/",
          description: "Retailer de luxe en ligne avec focus mode féminine haut de gamme",
          sector: "E-commerce/Luxury Fashion",
          location: "International",
          contact_name: "Blair Rutledge",
          contact_position: "Decision Maker",
          email: "customercare@net-a-porter.com",
          phone: "(877) 678-9627",
          whatsapp: null,
          quality_score: 92,
          status: "qualified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          extra_data: {
            decision_makers: ["Blair Rutledge", "Yelena Katchan"],
            linkedin_profiles: ["https://uk.linkedin.com/company/net-a-porter"]
          }
        },
        {
          id: 4,
          campaign_id: 1,
          company_name: "Luxury Fashion Group",
          website: "https://www.luxuryfashiongroup.com/",
          description: "Groupe de marques de mode de luxe avec portefeuille diversifié",
          sector: "Luxury Fashion Group",
          location: "International",
          contact_name: null,
          contact_position: null,
          email: null,
          phone: null,
          whatsapp: null,
          quality_score: 85,
          status: "identified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 5,
          campaign_id: 1,
          company_name: "SSENSE",
          website: "https://www.ssense.com/",
          description: "E-commerce de mode contemporaine et streetwear haut de gamme",
          sector: "E-commerce/Fashion",
          location: "International",
          contact_name: null,
          contact_position: null,
          email: null,
          phone: null,
          whatsapp: null,
          quality_score: 88,
          status: "identified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      setProspects(demoProspects);
      const total = demoProspects.length;
      const qualified = demoProspects.filter(p => p.quality_score >= 80).length;
      const contacted = demoProspects.filter(p => p.status === 'qualified').length;
      const avgScore = Math.round(demoProspects.reduce((sum, p) => sum + p.quality_score, 0) / total * 10) / 10;
      setStats({ total, qualified, contacted, avgScore });
    } finally {
      setLoading(false);
    }
  };

  const refreshProspects = async () => {
    await fetchProspects();
    toast.success("Liste des prospects mise à jour");
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400";
    if (score >= 75) return "text-blue-600 dark:text-blue-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  useEffect(() => {
    // Delay API call to avoid hydration mismatch
    const timer = setTimeout(() => {
      fetchProspects();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return {
    prospects,
    stats,
    loading,
    error,
    refreshProspects,
    getStatusLabel,
    getStatusVariant,
    getScoreColor,
  };
}