from crewai.tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field
import requests
import time
from urllib.parse import quote_plus

class SearchInput(BaseModel):
    """Input schema for SearchTool."""
    search_query: str = Field(..., description="The search query to execute")

class GlobalBusinessSearchTool(BaseTool):
    name: str = "Global Business Search"
    description: str = (
        "Recherche d'entreprises dans n'importe quel pays du monde. "
        "Utilise des sources locales et internationales pour trouver des informations sur les entreprises."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Recherche d'entreprises à l'international
        """
        try:
            # Simulation d'une recherche d'entreprises ivoiriennes
            # En production, vous pourriez intégrer avec:
            # - API Crunchbase (startups et entreprises tech)
            # - API LinkedIn Sales Navigator
            # - API Google Places/Maps pour entreprises locales
            # - API ZoomInfo, Apollo.io pour données B2B
            # - Chambres de commerce internationales
            # - Registres d'entreprises nationaux
            # - API Clearbit, Hunter.io pour enrichissement
            
            results = self._simulate_business_search(search_query)
            return results
            
        except Exception as e:
            return f"Erreur lors de la recherche: {str(e)}"
    
    def _simulate_business_search(self, query: str) -> str:
        """
        Simulation de recherche d'entreprises
        En production, remplacer par de vraies API
        """
        # Base de données simulée d'entreprises internationales
        sample_businesses = {
            "technologie": [
                {
                    "name": "Microsoft France",
                    "sector": "Logiciels",
                    "location": "Paris, France",
                    "website": "www.microsoft.fr",
                    "description": "Solutions logicielles et cloud pour entreprises"
                },
                {
                    "name": "Shopify Inc.",
                    "sector": "E-commerce",
                    "location": "Ottawa, Canada",
                    "website": "www.shopify.com",
                    "description": "Plateforme e-commerce pour PME"
                },
                {
                    "name": "SAP Deutschland",
                    "sector": "ERP/Software",
                    "location": "Walldorf, Allemagne",
                    "website": "www.sap.de",
                    "description": "Solutions d'entreprise et gestion"
                }
            ],
            "finance": [
                {
                    "name": "BNP Paribas",
                    "sector": "Banque",
                    "location": "Paris, France",
                    "website": "www.bnpparibas.com",
                    "description": "Groupe bancaire international"
                },
                {
                    "name": "Standard Bank",
                    "sector": "Banque",
                    "location": "Johannesburg, Afrique du Sud",
                    "website": "www.standardbank.com",
                    "description": "Banque panafricaine"
                }
            ],
            "commerce": [
                {
                    "name": "Carrefour Group",
                    "sector": "Distribution",
                    "location": "Boulogne-Billancourt, France",
                    "website": "www.carrefour.com",
                    "description": "Groupe de distribution international"
                },
                {
                    "name": "Metro AG",
                    "sector": "Commerce de gros",
                    "location": "Düsseldorf, Allemagne",
                    "website": "www.metro.de",
                    "description": "Commerce de gros international"
                }
            ],
            "industrie": [
                {
                    "name": "Siemens AG",
                    "sector": "Industrie/Technologie",
                    "location": "Munich, Allemagne",
                    "website": "www.siemens.com",
                    "description": "Solutions industrielles et d'automatisation"
                },
                {
                    "name": "Schneider Electric",
                    "sector": "Énergie/Automatisation",
                    "location": "Rueil-Malmaison, France",
                    "website": "www.schneider-electric.com",
                    "description": "Spécialiste de la gestion d'énergie"
                }
            ]
        }
        
        results = []
        query_lower = query.lower()
        
        for sector, businesses in sample_businesses.items():
            if any(keyword in query_lower for keyword in [sector, "entreprise", "société"]):
                for business in businesses:
                    results.append(
                        f"Entreprise: {business['name']}\n"
                        f"Secteur: {business['sector']}\n"
                        f"Localisation: {business['location']}\n"
                        f"Site web: {business['website']}\n"
                        f"Description: {business['description']}\n"
                        "---"
                    )
        
        if not results:
            return "Aucune entreprise trouvée pour cette recherche. Essayez des termes plus généraux."
        
        return "\n".join(results[:5])  # Limiter à 5 résultats

class ContactFinderTool(BaseTool):
    name: str = "Global Contact Finder"
    description: str = (
        "Trouve des informations de contact pour les entreprises du monde entier. "
        "Recherche emails, téléphones et contacts clés dans tous les pays."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Recherche d'informations de contact
        """
        try:
            # En production, intégrer avec:
            # - LinkedIn Sales Navigator (mondial)
            # - Hunter.io pour emails professionnels
            # - Apollo.io, ZoomInfo pour contacts B2B
            # - Clearbit pour enrichissement de données
            # - Bases de données locales par pays
            # - Annuaires professionnels internationaux
            # - Crunchbase pour contacts startup
            
            contacts = self._simulate_contact_search(search_query)
            return contacts
            
        except Exception as e:
            return f"Erreur lors de la recherche de contacts: {str(e)}"
    
    def _simulate_contact_search(self, company_name: str) -> str:
        """
        Simulation de recherche de contacts
        """
        # Base de données simulée de contacts internationaux
        sample_contacts = {
            "microsoft": {
                "contact_name": "Marie Dubois",
                "position": "Directrice Partenariats",
                "email": "marie.dubois@microsoft.com",
                "phone": "+33 1 44 76 50 00",
                "linkedin": "linkedin.com/in/marie-dubois-ms"
            },
            "shopify": {
                "contact_name": "James Thompson",
                "position": "Enterprise Sales Director",
                "email": "james.thompson@shopify.com",
                "phone": "+1 613 241 2727",
                "linkedin": "linkedin.com/in/jamesthompson-shopify"
            },
            "sap": {
                "contact_name": "Klaus Mueller",
                "position": "Regional Sales Manager",
                "email": "klaus.mueller@sap.com",
                "phone": "+49 6227 7-47474",
                "linkedin": "linkedin.com/in/klaus-mueller-sap"
            },
            "bnp paribas": {
                "contact_name": "Sophie Martin",
                "position": "Directrice Innovation",
                "email": "sophie.martin@bnpparibas.com",
                "phone": "+33 1 40 14 45 46",
                "linkedin": "linkedin.com/in/sophie-martin-bnp"
            },
            "siemens": {
                "contact_name": "Hans Schmidt",
                "position": "Business Development Manager",
                "email": "hans.schmidt@siemens.com",
                "phone": "+49 89 636 00",
                "linkedin": "linkedin.com/in/hans-schmidt-siemens"
            }
        }
        
        company_key = company_name.lower()
        
        for key, contact in sample_contacts.items():
            if key in company_key or any(word in company_key for word in key.split()):
                return (
                    f"Contact trouvé pour {company_name}:\n"
                    f"Nom: {contact['contact_name']}\n"
                    f"Poste: {contact['position']}\n"
                    f"Email: {contact['email']}\n"
                    f"Téléphone: {contact['phone']}\n"
                    f"LinkedIn: {contact.get('linkedin', 'Non disponible')}"
                )
        
        return f"Aucun contact spécifique trouvé pour {company_name}. Recommandé de chercher sur LinkedIn ou le site web de l'entreprise."

class GlobalMarketAnalysisTool(BaseTool):
    name: str = "Global Market Analysis"
    description: str = (
        "Analyse les marchés internationaux pour un produit ou service donné. "
        "Fournit des insights sur les secteurs porteurs et opportunités par région/pays."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Analyse de marché internationale
        """
        try:
            analysis = self._analyze_global_market(search_query)
            return analysis
            
        except Exception as e:
            return f"Erreur lors de l'analyse de marché: {str(e)}"
    
    def _analyze_global_market(self, product_service: str) -> str:
        """
        Analyse simulée du marché international
        """
        # Secteurs économiques clés à l'international
        key_sectors = {
            "technologie": "Secteur en forte croissance, IA, cloud, SaaS",
            "finance": "Fintech, services bancaires digitaux, blockchain",
            "sante": "Medtech, télémédecine, solutions digitales santé",
            "energie": "Énergies renouvelables, efficacité énergétique",
            "transport": "Mobilité électrique, logistique intelligente",
            "commerce": "E-commerce, retail tech, omnichannel",
            "industrie": "Industrie 4.0, IoT, automatisation",
            "agriculture": "AgTech, agriculture de précision, sustainability",
            "education": "EdTech, formation en ligne, outils pédagogiques",
            "immobilier": "PropTech, smart buildings, gestion immobilière"
        }
        
        product_lower = product_service.lower()
        relevant_sectors = []
        
        # Mapping produits/services vers secteurs
        if any(word in product_lower for word in ["digital", "logiciel", "software", "ia", "tech"]):
            relevant_sectors.extend(["telecoms", "finance", "commerce"])
        if any(word in product_lower for word in ["energie", "solaire", "électricité"]):
            relevant_sectors.extend(["energie", "industrie"])
        if any(word in product_lower for word in ["transport", "logistique"]):
            relevant_sectors.extend(["transport", "commerce"])
        if any(word in product_lower for word in ["construction", "bâtiment"]):
            relevant_sectors.extend(["construction"])
        
        if not relevant_sectors:
            relevant_sectors = ["commerce", "telecoms", "finance"]  # Secteurs par défaut
        
        analysis = f"Analyse de marché globale pour: {product_service}\n\n"
        analysis += "Secteurs recommandés à l'international:\n"
        
        for sector in relevant_sectors:
            if sector in key_sectors:
                analysis += f"- {sector.title()}: {key_sectors[sector]}\n"
        
        analysis += "\nOpportunités identifiées à l'international:\n"
        analysis += "- Marchés développés: Europe, Amérique du Nord (maturité technologique)\n"
        analysis += "- Marchés émergents: Afrique, Asie du Sud-Est, Amérique Latine (croissance rapide)\n"
        analysis += "- Digitalisation mondiale accélérée post-COVID\n"
        analysis += "- Adoption croissante des solutions SaaS/Cloud\n"
        analysis += "- Réglementation favorable à l'innovation dans de nombreux pays\n"
        
        return analysis