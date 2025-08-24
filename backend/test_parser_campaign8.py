#!/usr/bin/env python3
"""
Script de test pour vérifier que le parser amélioré peut extraire les prospects de la campagne 8
"""

import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire app au path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.prospect_parser import ProspectParser

async def test_campaign8_parser():
    """Test du parser amélioré avec la campagne 8"""
    
    print("🚀 Test du Parser Amélioré - Campagne 8")
    print("=" * 60)
    
    # Lire le fichier raw de la campagne 8
    raw_file = Path("data/campaign_8_raw.txt")
    if not raw_file.exists():
        print(f"❌ Fichier {raw_file} non trouvé")
        return
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    print(f"📄 Contenu brut lu ({len(raw_content)} caractères)")
    print("=" * 50)
    print(raw_content[:300] + "...")
    print("=" * 50)
    
    # Tester le parser amélioré
    parser = ProspectParser()
    prospects = await parser.parse_crewai_result(raw_content)
    
    print(f"🔍 Parser amélioré a extrait {len(prospects)} prospects")
    
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
    else:
        print("❌ Aucun prospect extrait - Le parser a encore des problèmes")

if __name__ == "__main__":
    asyncio.run(test_campaign8_parser())
    
    print("\n✅ Test terminé !")
