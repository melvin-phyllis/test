#!/usr/bin/env python
"""
AI Agent Prospecting Crew - Main Entry Point

Ce module permet d'exécuter directement les agents de prospection
pour tester le système ou l'utiliser en standalone.
"""

import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.ai_agent_crew.crew import ProspectingCrewManager
import json
from datetime import datetime

def main():
    """Main function to run the prospecting crew"""
    
    print("🚀 AI Agent Prospecting Platform - CrewAI")
    print("=" * 50)
    
    # Example inputs for testing
    sample_inputs = {
        "product": """
        Solution de gestion de stocks intelligente basée sur l'IA pour PME.
        Notre système aide les entreprises à optimiser leurs stocks, 
        réduire les coûts et améliorer leur rentabilité grâce à des 
        algorithmes prédictifs avancés.
        """,
        "target_location": "Côte d'Ivoire",
        "target_sectors": ["commerce", "distribution", "retail"],
        "prospect_count": 5,
        "current_year": str(datetime.now().year)
    }
    
    print("Configuration de la campagne:")
    print(f"- Produit: {sample_inputs['product'][:100]}...")
    print(f"- Localisation: {sample_inputs['target_location']}")
    print(f"- Secteurs: {', '.join(sample_inputs['target_sectors'])}")
    print(f"- Nombre de prospects: {sample_inputs['prospect_count']}")
    print("\n" + "=" * 50)
    
    try:
        # Initialize the crew manager
        crew_manager = ProspectingCrewManager()
        
        # Get crew information
        crew_info = crew_manager.get_crew_info()
        print("\n📋 Configuration de l'équipe:")
        for agent in crew_info['agents']:
            print(f"  • {agent}")
        
        print(f"\n🛠️  Outils disponibles:")
        for tool in crew_info['tools']:
            print(f"  • {tool}")
        
        print(f"\n⚙️  Processus: {crew_info['process']}")
        print(f"💾 Mémoire: {crew_info['memory']}")
        
        print("\n" + "=" * 50)
        print("🎯 Lancement de la campagne de prospection...")
        print("=" * 50)
        
        # Run the prospecting campaign
        result = crew_manager.run_prospecting_campaign(sample_inputs)
        
        print("\n" + "=" * 50)
        print("✅ Campagne terminée avec succès!")
        print("=" * 50)
        print("\n📊 Résultats:")
        print(result)
        
        # Save results to file
        output_file = f"prospecting_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("RÉSULTATS DE LA CAMPAGNE DE PROSPECTION\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Configuration:\n{json.dumps(sample_inputs, indent=2, ensure_ascii=False)}\n\n")
            f.write("RÉSULTATS:\n")
            f.write(result)
        
        print(f"\n💾 Résultats sauvegardés dans: {output_file}")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de l'exécution: {str(e)}")
        import traceback
        print(f"Détails: {traceback.format_exc()}")
        sys.exit(1)

def test_tools():
    """Test individual tools"""
    print("🧪 Test des outils...")
    
    from src.ai_agent_crew.tools.custom_tool import (
        IvorianBusinessSearchTool,
        ContactFinderTool, 
        MarketAnalysisTool
    )
    
    # Test business search
    business_tool = IvorianBusinessSearchTool()
    print("\n1. Test Recherche d'entreprises:")
    result = business_tool._run("entreprises technologie Abidjan")
    print(result[:200] + "..." if len(result) > 200 else result)
    
    # Test contact finder
    contact_tool = ContactFinderTool()
    print("\n2. Test Recherche de contacts:")
    result = contact_tool._run("Orange Côte d'Ivoire")
    print(result)
    
    # Test market analysis
    market_tool = MarketAnalysisTool()
    print("\n3. Test Analyse de marché:")
    result = market_tool._run("solution de gestion de stocks")
    print(result)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Agent Prospecting Crew")
    parser.add_argument("--test-tools", action="store_true", 
                       help="Test individual tools")
    parser.add_argument("--run-campaign", action="store_true", 
                       help="Run full prospecting campaign")
    
    args = parser.parse_args()
    
    if args.test_tools:
        test_tools()
    elif args.run_campaign:
        main()
    else:
        print("Usage:")
        print("  python -m src.ai_agent_crew.main --run-campaign")
        print("  python -m src.ai_agent_crew.main --test-tools")
        print("\nOr directly: python src/ai_agent_crew/main.py --run-campaign")