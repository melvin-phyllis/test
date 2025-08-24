#!/usr/bin/env python3
"""
Script de test complet de la prospection avec le parser corrigé
"""

import asyncio
import sys
import time
from pathlib import Path

# Ajouter le répertoire app au path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.prospect_parser import ProspectParser

async def test_complete_prospecting():
    """Test complet de la prospection"""
    
    print("🚀 Test Complet de la Prospection avec Parser Corrigé")
    print("=" * 60)
    
    # Test 1: Parser avec fichier existant
    print("\n🔍 Test 1: Parser avec fichier existant (campaign_5_raw.txt)")
    print("-" * 50)
    
    raw_file = Path("data/campaign_5_raw.txt")
    if raw_file.exists():
        with open(raw_file, 'r', encoding='utf-8') as f:
            raw_content = f.read()
        
        parser = ProspectParser()
        prospects = await parser.parse_crewai_result(raw_content)
        
        print(f"✅ Parser a extrait {len(prospects)} prospects")
        for i, prospect in enumerate(prospects, 1):
            print(f"  {i}. {prospect.get('company_name', 'N/A')}")
            print(f"     Contact: {prospect.get('contact_name', 'N/A')}")
            print(f"     Email: {prospect.get('email', 'N/A')}")
            print(f"     Sector: {prospect.get('sector', 'N/A')}")
    else:
        print("❌ Fichier campaign_5_raw.txt non trouvé")
    
    # Test 2: Vérifier les campagnes existantes
    print("\n🔍 Test 2: Vérification des campagnes existantes")
    print("-" * 50)
    
    import subprocess
    try:
        result = subprocess.run([
            "curl", "-s", "http://localhost:8000/api/v1/prospecting/campaigns"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ API des campagnes accessible")
            print(f"📊 Réponse: {result.stdout[:200]}...")
        else:
            print("❌ API des campagnes non accessible")
    except Exception as e:
        print(f"❌ Erreur lors du test API: {e}")
    
    # Test 3: Vérifier le statut de la campagne 7
    print("\n🔍 Test 3: Statut de la campagne 7 (Test Final Parser)")
    print("-" * 50)
    
    try:
        result = subprocess.run([
            "curl", "-s", "http://localhost:8000/api/v1/prospecting/campaigns/7"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Statut de la campagne 7 récupéré")
            if "completed" in result.stdout:
                print("🎉 Campagne 7 terminée !")
                # Vérifier les prospects
                prospects_result = subprocess.run([
                    "curl", "-s", "http://localhost:8000/api/v1/prospects?campaign_id=7"
                ], capture_output=True, text=True)
                
                if prospects_result.returncode == 0 and prospects_result.stdout.strip():
                    print("✅ Prospects trouvés pour la campagne 7 !")
                    print(f"📊 Prospects: {prospects_result.stdout}")
                else:
                    print("❌ Aucun prospect trouvé pour la campagne 7")
            else:
                print("⏳ Campagne 7 encore en cours...")
        else:
            print("❌ Impossible de récupérer le statut de la campagne 7")
    except Exception as e:
        print(f"❌ Erreur lors du test de statut: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Test complet terminé !")

if __name__ == "__main__":
    asyncio.run(test_complete_prospecting())
