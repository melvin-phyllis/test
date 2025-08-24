#!/usr/bin/env python3
"""
Script pour déboguer et analyser la sortie CrewAI brute
"""
import sys
import os
from pathlib import Path

# Add app to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.core.database import AsyncSessionLocal
from app.models.campaign import Campaign
from sqlalchemy import select
import asyncio

async def debug_latest_campaign():
    """Debug la dernière campagne pour voir le résultat brut"""
    print("🔍 Debug de la sortie CrewAI brute")
    print("=" * 60)
    
    try:
        async with AsyncSessionLocal() as db:
            # Récupérer la dernière campagne
            result = await db.execute(
                select(Campaign)
                .order_by(Campaign.id.desc())
                .limit(1)
            )
            campaign = result.scalar_one_or_none()
            
            if not campaign:
                print("❌ Aucune campagne trouvée")
                return
            
            print(f"📊 Campagne ID: {campaign.id}")
            print(f"🎯 Produit: {campaign.product_description}")
            print(f"📍 Localisation: {campaign.target_location}")
            print(f"📈 Status: {campaign.status}")
            print(f"🕐 Créée: {campaign.created_at}")
            print()
            
            # Vérifier s'il y a un résumé des résultats
            if campaign.results_summary:
                print("📋 Résumé des résultats:")
                print(f"   {campaign.results_summary}")
                print()
            
            # Pour déboguer, nous devons simuler une sortie CrewAI
            # Voici un exemple de sortie réelle que nous avons vue
            sample_crewai_output = """
            Based on the market research and analysis conducted, here are the qualified prospects identified for lead-generation partnerships in the luxury e-commerce sector:

            1. **Farfetch**
               - **Website:** [Farfetch](https://www.farfetch.com/)
               - **Contact Information:**
                 - LinkedIn: [Farfetch LinkedIn](https://www.linkedin.com/company/farfetch.com)
                 - Customer Service Email: customercare@farfetch.com
                 - Phone: (646) 791-3768
               - **Key Decision Makers:**
                 - Joshua Dent - [LinkedIn](https://www.linkedin.com/in/dentjoshua)
                 - Christine Mou - [LinkedIn](https://www.linkedin.com/in/christinemou)
               - **Outreach Strategy:**
                 - Highlight case studies of successful lead-generation partnerships.
                 - Emphasize enhanced CRM tools to improve client insight and sales retention.

            2. **Mytheresa**
               - **Website:** [Mytheresa](https://www.mytheresa.com/)
               - **Contact Information:**
                 - LinkedIn: [Mytheresa LinkedIn](https://www.linkedin.com/company/mytheresa-com)
                 - Customer Service Phone: 1-888-550-9675
               - **Key Decision Makers:**
                 - Aaron Alexander - [LinkedIn](https://www.linkedin.com/in/aaron-alexander-1b7b185a)
                 - Jessica Amodio - [LinkedIn](https://www.linkedin.com/in/jessica-amodio-b5110961)
               - **Outreach Strategy:**
                 - Present tailored marketing campaigns focused on their high-value customer base.
                 - Discuss CRM integration benefits to streamline luxury service offerings.

            3. **Net-a-Porter**
               - **Website:** [Net-a-Porter](https://www.net-a-porter.com/)
               - **Contact Information:**
                 - LinkedIn: [Net-a-Porter LinkedIn](https://uk.linkedin.com/company/net-a-porter)
                 - Customer Service Email: customercare@net-a-porter.com
                 - Phone: (877) 678-9627
               - **Key Decision Makers:**
                 - Blair Rutledge - [LinkedIn](https://www.linkedin.com/in/blair-rutledge-44a1764b)
                 - Yelena Katchan - [LinkedIn](https://www.linkedin.com/in/yelenakatchan)
               - **Outreach Strategy:**
                 - Emphasize their need for personalized customer experiences and how CRM can enhance that.
                 - Offer to share insights on the luxury consumer behavior trends in e-commerce.
            """
            
            print("🧪 Test du parser avec une sortie CrewAI simulée:")
            print("=" * 60)
            
            # Tester le parser
            from app.services.prospect_parser import ProspectParser
            parser = ProspectParser()
            
            prospects = await parser.parse_crewai_result(sample_crewai_output)
            
            print(f"✅ Parser a trouvé {len(prospects)} prospects:")
            print()
            
            for i, prospect in enumerate(prospects, 1):
                print(f"🏢 {i}. {prospect.get('company_name', 'Nom manquant')}")
                print(f"   🌐 Site: {prospect.get('website', 'N/A')}")
                print(f"   📧 Email: {prospect.get('email', 'N/A')}")
                print(f"   📞 Tél: {prospect.get('phone', 'N/A')}")
                print(f"   👤 Contact: {prospect.get('contact_name', 'N/A')}")
                print(f"   🎯 Secteur: {prospect.get('sector', 'N/A')}")
                print(f"   ⭐ Score: {prospect.get('quality_score', 0)}/100")
                print(f"   📍 Lieu: {prospect.get('location', 'N/A')}")
                if prospect.get('extra_data', {}).get('decision_makers'):
                    print(f"   👥 Décideurs: {', '.join(prospect['extra_data']['decision_makers'])}")
                print()
            
            # Tester avec les fragments problématiques actuels
            print("🔍 Analysis des fragments problématiques:")
            print("=" * 60)
            
            problematic_fragments = [
                "emphasizing strategic partners",
                "Form partners", 
                "of global",
                "The global",
                "Carrefour Group"
            ]
            
            for fragment in problematic_fragments:
                print(f"Fragment: '{fragment}'")
                test_prospects = await parser.parse_crewai_result(fragment)
                if test_prospects:
                    print(f"  ⚠️  Parser trouve: {test_prospects[0].get('company_name', 'N/A')}")
                else:
                    print(f"  ✅ Aucun prospect trouvé (correct)")
                print()
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()

async def main():
    await debug_latest_campaign()

if __name__ == "__main__":
    asyncio.run(main())