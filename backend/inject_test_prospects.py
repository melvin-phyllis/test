#!/usr/bin/env python3
"""
Script pour injecter les prospects CrewAI dans la base de données
"""
import requests
import json
from datetime import datetime

# URL de votre API
API_BASE_URL = "http://192.168.1.69:8000/api/v1"

# Prospects extraits de vos données CrewAI réelles
TEST_PROSPECTS = [
    {
        "campaign_id": 1,
        "company_name": "Farfetch",
        "website": "https://www.farfetch.com/",
        "description": "Plateforme e-commerce de luxe internationale avec marketplace fashion",
        "sector": "E-commerce/Luxury Fashion", 
        "location": "International",
        "contact_name": "Joshua Dent",
        "contact_position": "Decision Maker",
        "email": "customercare@farfetch.com",
        "phone": "(646) 791-3768",
        "quality_score": 95,
        "status": "qualified",
        "extra_data": {
            "decision_makers": ["Joshua Dent", "Christine Mou"],
            "linkedin_profiles": [
                "https://www.linkedin.com/company/farfetch.com",
                "https://www.linkedin.com/in/dentjoshua",
                "https://www.linkedin.com/in/christinemou"
            ],
            "outreach_strategy": "Highlight case studies of successful lead-generation partnerships"
        }
    },
    {
        "campaign_id": 1,
        "company_name": "Mytheresa",
        "website": "https://www.mytheresa.com/",
        "description": "E-commerce premium de mode de luxe",
        "sector": "E-commerce/Luxury Fashion",
        "location": "International", 
        "contact_name": "Aaron Alexander",
        "contact_position": "Decision Maker",
        "phone": "1-888-550-9675",
        "quality_score": 90,
        "status": "qualified",
        "extra_data": {
            "decision_makers": ["Aaron Alexander", "Jessica Amodio"],
            "linkedin_profiles": [
                "https://www.linkedin.com/company/mytheresa-com",
                "https://www.linkedin.com/in/aaron-alexander-1b7b185a",
                "https://www.linkedin.com/in/jessica-amodio-b5110961"
            ],
            "outreach_strategy": "Present tailored marketing campaigns for high-value customer base"
        }
    },
    {
        "campaign_id": 1,
        "company_name": "Net-a-Porter",
        "website": "https://www.net-a-porter.com/",
        "description": "Retailer de luxe en ligne avec focus mode féminine haut de gamme",
        "sector": "E-commerce/Luxury Fashion",
        "location": "International",
        "contact_name": "Blair Rutledge", 
        "contact_position": "Decision Maker",
        "email": "customercare@net-a-porter.com",
        "phone": "(877) 678-9627",
        "quality_score": 92,
        "status": "qualified",
        "extra_data": {
            "decision_makers": ["Blair Rutledge", "Yelena Katchan"],
            "linkedin_profiles": [
                "https://uk.linkedin.com/company/net-a-porter",
                "https://www.linkedin.com/in/blair-rutledge-44a1764b",
                "https://www.linkedin.com/in/yelenakatchan"
            ],
            "outreach_strategy": "Emphasize personalized customer experiences and CRM enhancement"
        }
    },
    {
        "campaign_id": 1,
        "company_name": "Luxury Fashion Group",
        "website": "https://www.luxuryfashiongroup.com/",
        "description": "Groupe de marques de mode de luxe avec portefeuille diversifié",
        "sector": "Luxury Fashion Group",
        "location": "International",
        "quality_score": 85,
        "status": "identified",
        "extra_data": {
            "outreach_strategy": "Showcase successful collaborations with similar luxury brands"
        }
    },
    {
        "campaign_id": 1, 
        "company_name": "SSENSE",
        "website": "https://www.ssense.com/",
        "description": "E-commerce de mode contemporaine et streetwear haut de gamme", 
        "sector": "E-commerce/Fashion",
        "location": "International",
        "quality_score": 88,
        "status": "identified",
        "extra_data": {
            "outreach_strategy": "Leverage data analytics for personalized marketing strategies"
        }
    }
]

def create_prospects():
    """Créer les prospects via l'API"""
    print("🚀 Injection des prospects CrewAI dans la base de données...")
    print("=" * 60)
    
    created_prospects = []
    
    for i, prospect_data in enumerate(TEST_PROSPECTS, 1):
        try:
            print(f"📤 {i}/5: Création de {prospect_data['company_name']}...")
            
            response = requests.post(
                f"{API_BASE_URL}/prospects/",
                json=prospect_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 201:
                created_prospect = response.json()
                created_prospects.append(created_prospect)
                print(f"   ✅ Créé avec ID: {created_prospect.get('id', 'Unknown')}")
                
                # Afficher les détails
                print(f"   🏢 Entreprise: {prospect_data['company_name']}")
                print(f"   📧 Email: {prospect_data.get('email', 'Non renseigné')}")
                print(f"   📞 Téléphone: {prospect_data.get('phone', 'Non renseigné')}")
                print(f"   👤 Contact: {prospect_data.get('contact_name', 'À identifier')}")
                print(f"   ⭐ Score: {prospect_data['quality_score']}/100")
                print()
                
            else:
                print(f"   ❌ Erreur HTTP {response.status_code}: {response.text}")
                print()
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Erreur réseau: {str(e)}")
            print()
        except Exception as e:
            print(f"   ❌ Erreur: {str(e)}")
            print()
    
    print("=" * 60)
    print(f"🎉 RÉSULTAT: {len(created_prospects)}/{len(TEST_PROSPECTS)} prospects créés avec succès!")
    
    if created_prospects:
        print(f"✅ Les prospects sont maintenant disponibles sur votre interface:")
        print(f"   🌐 http://192.168.1.69:3001/app/prospects")
        print()
        print(f"📊 Statistiques attendues:")
        print(f"   • Total: {len(created_prospects)} prospects")
        print(f"   • Qualifiés: {len([p for p in TEST_PROSPECTS if p['quality_score'] >= 80])}")
        print(f"   • Avec email: {len([p for p in TEST_PROSPECTS if p.get('email')])}")
        print(f"   • Avec téléphone: {len([p for p in TEST_PROSPECTS if p.get('phone')])}")
        print(f"   • Score moyen: {sum(p['quality_score'] for p in TEST_PROSPECTS) / len(TEST_PROSPECTS):.1f}/100")
    else:
        print("❌ Aucun prospect créé. Vérifiez que l'API backend fonctionne sur http://localhost:8000")
        print("💡 Lancez: uvicorn app.main:app --reload")

def get_prospects():
    """Vérifier les prospects existants"""
    try:
        print("🔍 Vérification des prospects existants...")
        response = requests.get(f"{API_BASE_URL}/prospects/?limit=10")
        
        if response.status_code == 200:
            prospects = response.json()
            print(f"📋 {len(prospects)} prospects trouvés dans la base de données")
            
            for prospect in prospects[:3]:  # Afficher les 3 premiers
                print(f"   • {prospect.get('company_name', 'Unknown')} - Score: {prospect.get('quality_score', 0)}")
            
            if len(prospects) > 3:
                print(f"   ... et {len(prospects) - 3} autres")
            print()
            
        else:
            print(f"❌ Impossible de récupérer les prospects: HTTP {response.status_code}")
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {str(e)}")

if __name__ == "__main__":
    print("🧪 Script d'injection de prospects CrewAI")
    print("=" * 60)
    
    # Vérifier les prospects existants
    get_prospects()
    
    # Créer les nouveaux prospects
    create_prospects()
    
    print("\n🎯 Prochaines étapes:")
    print("1. Ouvrez http://192.168.1.69:3001/app/prospects")
    print("2. Vous devriez voir vos 5 prospects CrewAI")
    print("3. Testez les filtres et la recherche")
    print("4. Lancez une vraie campagne pour valider le nouveau parser!")