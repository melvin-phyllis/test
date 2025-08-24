#!/usr/bin/env python3
"""
Script pour forcer l'extraction des prospects de la campagne 8 et les sauvegarder
"""

import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire app au path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.prospect_parser import ProspectParser

async def force_extract_campaign8():
    """Force l'extraction des prospects de la campagne 8"""
    
    print("🚀 Extraction forcée des prospects de la campagne 8")
    print("=" * 60)
    
    # Lire le fichier raw de la campagne 8
    raw_file = Path("data/campaign_8_raw.txt")
    if not raw_file.exists():
        print(f"❌ Fichier {raw_file} non trouvé")
        return
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    print(f"📄 Contenu brut lu ({len(raw_content)} caractères)")
    
    # Tester le parser
    parser = ProspectParser()
    prospects = await parser.parse_crewai_result(raw_content)
    
    print(f"🔍 Parser a extrait {len(prospects)} prospects")
    
    if prospects:
        print("✅ Prospects extraits avec succès !")
        for i, prospect in enumerate(prospects, 1):
            print(f"\n  {i}. {prospect.get('company_name', 'N/A')}")
            print(f"     Description: {prospect.get('description', 'N/A')}")
            print(f"     Score: {prospect.get('quality_score', 'N/A')}/100")
            print(f"     Statut: {prospect.get('status', 'N/A')}")
            print(f"     Secteur: {prospect.get('sector', 'N/A')}")
            print(f"     Localisation: {prospect.get('location', 'N/A')}")
            
            # Afficher les détails de scoring
            if prospect.get('extra_data', {}).get('scoring'):
                scoring = prospect['extra_data']['scoring']
                print(f"     Scoring:")
                print(f"       - Market Relevance: {scoring.get('market_relevance', 'N/A')}/5")
                print(f"       - Innovation Potential: {scoring.get('innovation_potential', 'N/A')}/5")
                print(f"       - Accessibility: {scoring.get('accessibility', 'N/A')}/5")
                print(f"       - Total Score: {scoring.get('total_score', 'N/A')}/15")
        
        # Créer les prospects manuellement si nécessaire
        print("\n🔧 Création manuelle des prospects...")
        manual_prospects = []
        
        for prospect in prospects:
            manual_prospect = {
                "campaign_id": 8,
                "company_name": prospect["company_name"],
                "contact_name": "À déterminer",
                "contact_position": "Contact à établir",
                "email": "",
                "phone": "",
                "website": "",
                "sector": prospect.get("sector", "Finance"),
                "location": prospect.get("location", "Lyon, France"),
                "quality_score": prospect.get("quality_score", 85.0),
                "status": prospect.get("status", "qualified"),
                "description": prospect.get("description", f"Prospect qualifié identifié par les agents IA pour {prospect['company_name']}"),
                "extra_data": prospect.get("extra_data", {})
            }
            manual_prospects.append(manual_prospect)
        
        print(f"✅ {len(manual_prospects)} prospects prêts à être créés")
        
        # Sauvegarder en base via l'API
        await save_prospects_via_api(manual_prospects)
        
    else:
        print("❌ Aucun prospect extrait")

async def save_prospects_via_api(prospects_data):
    """Sauvegarder les prospects via l'API"""
    
    print(f"💾 Sauvegarde de {len(prospects_data)} prospects via l'API...")
    
    # Essayer de créer les prospects via l'API
    import subprocess
    
    for prospect in prospects_data:
        # Créer un fichier JSON temporaire pour ce prospect
        import json
        temp_file = f"temp_prospect_{prospect['company_name'].replace(' ', '_')}.json"
        
        with open(temp_file, 'w') as f:
            json.dump(prospect, f, indent=2)
        
        try:
            # Essayer de créer le prospect via l'API
            result = subprocess.run([
                "curl", "-X", "POST", 
                "http://localhost:8000/api/v1/prospects",
                "-H", "Content-Type: application/json",
                "-d", f"@{temp_file}"
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"  ✅ Prospect {prospect['company_name']} créé")
            else:
                print(f"  ❌ Erreur pour {prospect['company_name']}: {result.stderr}")
                
        except Exception as e:
            print(f"  ❌ Exception pour {prospect['company_name']}: {e}")
        
        finally:
            # Nettoyer le fichier temporaire
            if Path(temp_file).exists():
                Path(temp_file).unlink()
    
    print("🎉 Tentative de sauvegarde terminée !")

if __name__ == "__main__":
    asyncio.run(force_extract_campaign8())
    
    print("\n✅ Extraction forcée terminée !")
