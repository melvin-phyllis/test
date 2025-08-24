#!/usr/bin/env python3
"""
Script de test pour vérifier que le parser corrigé fonctionne
"""

import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire app au path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.prospect_parser import ProspectParser

async def test_corrected_parser():
    """Test du parser corrigé"""
    
    print("🔍 Test du parser corrigé...")
    
    # Lire le fichier raw de la campagne 5
    raw_file = Path("data/campaign_5_raw.txt")
    if not raw_file.exists():
        print(f"❌ Fichier {raw_file} non trouvé")
        return
    
    with open(raw_file, 'r', encoding='utf-8') as f:
        raw_content = f.read()
    
    print(f"📄 Contenu brut lu ({len(raw_content)} caractères)")
    print("=" * 50)
    print(raw_content[:200] + "...")
    print("=" * 50)
    
    # Tester le parser corrigé
    parser = ProspectParser()
    prospects = await parser.parse_crewai_result(raw_content)
    
    print(f"🔍 Parser corrigé a extrait {len(prospects)} prospects")
    
    if prospects:
        print("✅ Prospects extraits avec succès !")
        for i, prospect in enumerate(prospects, 1):
            print(f"\n  {i}. {prospect.get('company_name', 'N/A')}")
            print(f"     Contact: {prospect.get('contact_name', 'N/A')}")
            print(f"     Position: {prospect.get('contact_position', 'N/A')}")
            print(f"     Email: {prospect.get('email', 'N/A')}")
            print(f"     Phone: {prospect.get('phone', 'N/A')}")
            print(f"     Sector: {prospect.get('sector', 'N/A')}")
            print(f"     Location: {prospect.get('location', 'N/A')}")
            print(f"     Quality Score: {prospect.get('quality_score', 'N/A')}")
    else:
        print("❌ Aucun prospect extrait - Le parser a encore des problèmes")

if __name__ == "__main__":
    print("🚀 Test du parser corrigé")
    print("=" * 50)
    
    asyncio.run(test_corrected_parser())
    
    print("\n✅ Test terminé !")
