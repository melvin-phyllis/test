from crewai.tools import BaseTool
from typing import Type, Any
from pydantic import BaseModel, Field
import requests
import time
from urllib.parse import quote_plus

class SearchInput(BaseModel):
    """Input schema for SearchTool."""
    search_query: str = Field(..., description="The search query to execute")

class IvorianBusinessSearchTool(BaseTool):
    name: str = "Ivorian Business Search"
    description: str = (
        "Recherche d'entreprises en Côte d'Ivoire. "
        "Utilise des sources locales pour trouver des informations sur les entreprises ivoiriennes."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Recherche d'entreprises en Côte d'Ivoire
        """
        try:
            # Simulation d'une recherche d'entreprises ivoiriennes
            # En production, vous pourriez intégrer avec:
            # - API du CEPICI (Centre de Promotion des Investissements en Côte d'Ivoire)
            # - Annuaires d'entreprises locaux
            # - Pages Jaunes Côte d'Ivoire
            # - Bases de données commerciales locales
            
            results = self._simulate_business_search(search_query)
            return results
            
        except Exception as e:
            return f"Erreur lors de la recherche: {str(e)}"
    
    def _simulate_business_search(self, query: str) -> str:
        """
        Simulation de recherche d'entreprises
        En production, remplacer par de vraies API
        """
        # Base de données simulée d'entreprises ivoiriennes
        sample_businesses = {
            "technologie": [
                {
                    "name": "Côte d'Ivoire Telecom",
                    "sector": "Télécommunications",
                    "location": "Abidjan, Plateau",
                    "website": "www.orangeci.com",
                    "description": "Opérateur télécom leader en Côte d'Ivoire"
                },
                {
                    "name": "Ivorian Digital Solutions",
                    "sector": "Services IT",
                    "location": "Abidjan, Cocody",
                    "website": "www.ids-ci.com",
                    "description": "Solutions digitales pour entreprises"
                }
            ],
            "finance": [
                {
                    "name": "Bank of Africa Côte d'Ivoire",
                    "sector": "Banque",
                    "location": "Abidjan, Plateau",
                    "website": "www.boa.ci",
                    "description": "Institution bancaire panafricaine"
                }
            ],
            "commerce": [
                {
                    "name": "CFAO Côte d'Ivoire",
                    "sector": "Distribution",
                    "location": "Abidjan, Zone Industrielle",
                    "website": "www.cfao.ci",
                    "description": "Groupe de distribution et services"
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
    name: str = "Contact Finder"
    description: str = (
        "Trouve des informations de contact pour les entreprises ivoiriennes. "
        "Recherche emails, téléphones et contacts clés."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Recherche d'informations de contact
        """
        try:
            # En production, intégrer avec:
            # - LinkedIn Sales Navigator
            # - Bases de données de contacts locales
            # - Annuaires professionnels
            # - Sites web d'entreprises
            
            contacts = self._simulate_contact_search(search_query)
            return contacts
            
        except Exception as e:
            return f"Erreur lors de la recherche de contacts: {str(e)}"
    
    def _simulate_contact_search(self, company_name: str) -> str:
        """
        Simulation de recherche de contacts
        """
        # Base de données simulée de contacts
        sample_contacts = {
            "côte d'ivoire telecom": {
                "contact_name": "Aminata KOUAME",
                "position": "Directrice Commerciale",
                "email": "a.kouame@orange.ci",
                "phone": "+225 20 30 40 50",
                "whatsapp": "+225 07 08 09 10"
            },
            "bank of africa": {
                "contact_name": "Moussa DIALLO",
                "position": "Directeur Digital",
                "email": "m.diallo@boa.ci",
                "phone": "+225 20 25 35 45",
                "whatsapp": "+225 05 06 07 08"
            },
            "cfao": {
                "contact_name": "Elisabeth ASSI",
                "position": "Chief Technology Officer",
                "email": "e.assi@cfao.ci",
                "phone": "+225 20 21 22 23",
                "whatsapp": "+225 01 02 03 04"
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
                    f"WhatsApp: {contact['whatsapp']}"
                )
        
        return f"Aucun contact spécifique trouvé pour {company_name}. Recommandé de chercher sur LinkedIn ou le site web de l'entreprise."

class MarketAnalysisTool(BaseTool):
    name: str = "Market Analysis"
    description: str = (
        "Analyse le marché ivoirien pour un produit ou service donné. "
        "Fournit des insights sur les secteurs porteurs et les opportunités."
    )
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, search_query: str) -> str:
        """
        Analyse de marché pour la Côte d'Ivoire
        """
        try:
            analysis = self._analyze_ivorian_market(search_query)
            return analysis
            
        except Exception as e:
            return f"Erreur lors de l'analyse de marché: {str(e)}"
    
    def _analyze_ivorian_market(self, product_service: str) -> str:
        """
        Analyse simulée du marché ivoirien
        """
        # Secteurs économiques clés en Côte d'Ivoire
        key_sectors = {
            "agriculture": "Premier secteur économique, cacao, café, hévéa",
            "telecoms": "Secteur en croissance, digitalisation en cours",
            "finance": "Secteur bancaire développé, fintech émergente",
            "energie": "Besoins importants en solutions énergétiques",
            "transport": "Développement des infrastructures",
            "commerce": "Secteur dynamique, e-commerce en développement",
            "industrie": "Transformation agroalimentaire, textile",
            "construction": "BTP en croissance avec les infrastructures"
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
        
        analysis = f"Analyse de marché pour: {product_service}\n\n"
        analysis += "Secteurs recommandés en Côte d'Ivoire:\n"
        
        for sector in relevant_sectors:
            if sector in key_sectors:
                analysis += f"- {sector.title()}: {key_sectors[sector]}\n"
        
        analysis += "\nOpportunités identifiées:\n"
        analysis += "- Marché en croissance avec 26+ millions d'habitants\n"
        analysis += "- Hub économique de l'Afrique de l'Ouest\n"
        analysis += "- Gouvernement favorable à l'innovation\n"
        analysis += "- Digitalisation accélérée post-COVID\n"
        
        return analysis