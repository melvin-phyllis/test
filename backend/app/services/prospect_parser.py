import re
from typing import Dict, Any, List
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ProspectParser:
    """Parse prospects from CrewAI output"""
    
    async def parse_crewai_result(self, result: Any) -> List[Dict[str, Any]]:
        """Parse CrewAI result and extract prospect information"""
        try:
            # Convert result to string if needed
            result_text = str(result) if not isinstance(result, str) else result
            
            # Extract prospect information using multiple parsing strategies
            prospects = []
            
            # Strategy 1: Look for structured prospect sections
            prospects.extend(self._extract_structured_prospects(result_text))
            
            # Strategy 2: Look for company names and details
            if not prospects:
                prospects.extend(self._extract_company_details(result_text))
            
            # Strategy 3: Fallback to basic extraction
            if not prospects:
                prospects.extend(self._extract_basic_info(result_text))
            
            # Clean and validate prospects
            cleaned_prospects = []
            for prospect in prospects:
                cleaned = self._clean_prospect_data(prospect)
                if cleaned.get('company_name'):
                    cleaned_prospects.append(cleaned)
            
            logger.info(f"Extracted {len(cleaned_prospects)} prospects from CrewAI result")
            return cleaned_prospects
            
        except Exception as e:
            logger.error(f"Error parsing CrewAI result: {str(e)}")
            return []
    
    def _extract_structured_prospects(self, text: str) -> List[Dict[str, Any]]:
        """Extract prospects from structured output"""
        prospects = []
        
        # Pattern for structured prospect blocks
        patterns = [
            # Pattern 1: Numbered prospect blocks
            r'(?:Prospect|Entreprise|Company)\s*(?:#|\d+)[:\s]*([^:]+):\s*\n(.*?)(?=\n(?:Prospect|Entreprise|Company)\s*(?:#|\d+)|$)',
            
            # Pattern 2: Header-based blocks
            r'## (?:Prospect|Entreprise|Company).*?\n(.*?)(?=\n## |$)',
            
            # Pattern 3: Simple company blocks
            r'([A-Z][A-Za-z\s&]+(?:Ltd|Limited|SARL|SA|SAS|CI)?)\s*\n(.*?)(?=\n[A-Z][A-Za-z\s&]+(?:Ltd|Limited|SARL|SA|SAS|CI)?|\n\n|$)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
            for match in matches:
                if len(match.groups()) >= 2:
                    company_name = match.group(1).strip()
                    details = match.group(2).strip()
                    
                    prospect = self._parse_prospect_details(company_name, details)
                    if prospect:
                        prospects.append(prospect)
                break  # Use first successful pattern
        
        return prospects
    
    def _extract_company_details(self, text: str) -> List[Dict[str, Any]]:
        """Extract company information from free text"""
        prospects = []
        
        # Look for international company patterns
        company_patterns = [
            r'([A-Z][A-Za-z\s&]+(?:Ltd|Limited|Inc|Corp|GmbH|SA|SAS|SARL|AG|SpA|BV))',
            r'([A-Z][A-Za-z\s]+(?:Bank|Banking|Financial|Finance))',
            r'([A-Z][A-Za-z\s]+(?:Telecom|Digital|Solutions|Services|Technology|Tech))',
            r'([A-Z][A-Za-z\s]+(?:Group|Holdings|International|Global))',
            r'([A-Z][A-Za-z\s]+(?:Systems|Software|Consulting|Partners))'
        ]
        
        found_companies = set()
        
        for pattern in company_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                company_name = match.group(1).strip()
                if len(company_name) > 3 and company_name not in found_companies:
                    found_companies.add(company_name)
                    
                    # Extract surrounding context for details
                    start = max(0, match.start() - 200)
                    end = min(len(text), match.end() + 200)
                    context = text[start:end]
                    
                    prospect = self._parse_prospect_details(company_name, context)
                    prospects.append(prospect)
        
        return prospects
    
    def _extract_basic_info(self, text: str) -> List[Dict[str, Any]]:
        """Basic extraction as fallback"""
        prospects = []
        
        # Sample international companies for demonstration
        sample_companies = [
            {
                "company_name": "Microsoft France",
                "sector": "Technology/Software",
                "location": "Paris, France",
                "website": "www.microsoft.fr"
            },
            {
                "company_name": "SAP Deutschland",
                "sector": "Enterprise Software",
                "location": "Walldorf, Germany",
                "website": "www.sap.de"
            },
            {
                "company_name": "Shopify Inc.",
                "sector": "E-commerce Platform",
                "location": "Ottawa, Canada",
                "website": "www.shopify.com"
            },
            {
                "company_name": "BNP Paribas",
                "sector": "Banking/Finance",
                "location": "Paris, France",
                "website": "www.bnpparibas.com"
            }
        ]
        
        # Check if text mentions any of these companies
        text_lower = text.lower()
        for company in sample_companies:
            company_name_lower = company["company_name"].lower()
            if any(word in text_lower for word in company_name_lower.split()):
                prospects.append({
                    **company,
                    "description": f"Entreprise identifiée dans le secteur {company['sector']}",
                    "quality_score": 6.0,
                    "status": "identified"
                })
        
        return prospects
    
    def _parse_prospect_details(self, company_name: str, details: str) -> Dict[str, Any]:
        """Parse detailed information for a prospect"""
        prospect = {
            "company_name": company_name,
            "quality_score": 5.0,
            "status": "identified",
            "location": "Non spécifié"
        }
        
        # Extract website
        website_match = re.search(r'(?:site|web|website)[:\s]*([www\.]?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', details, re.IGNORECASE)
        if website_match:
            website = website_match.group(1)
            if not website.startswith('www.'):
                website = 'www.' + website
            prospect['website'] = website
        
        # Extract sector
        sector_patterns = [
            r'(?:secteur|domain|industry)[:\s]*([^.\n]+)',
            r'(?:télécommunications|banque|finance|commerce|technologie|distribution|industrie)'
        ]
        for pattern in sector_patterns:
            sector_match = re.search(pattern, details, re.IGNORECASE)
            if sector_match:
                prospect['sector'] = sector_match.group(1 if sector_match.groups() else 0).strip()
                break
        
        # Extract description
        desc_patterns = [
            r'(?:description|activité)[:\s]*([^.\n]+)',
            r'([A-Z][^.]+(?:entreprise|société|company)[^.]*\.)'
        ]
        for pattern in desc_patterns:
            desc_match = re.search(pattern, details, re.IGNORECASE)
            if desc_match:
                prospect['description'] = desc_match.group(1).strip()
                break
        
        # Extract contact information
        contact_patterns = {
            'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
            'phone': r'(?:\+225\s*)?(?:\d{2}\s*){4,5}',
            'contact_name': r'(?:contact|directeur|manager)[:\s]*([A-Z][a-zA-Z\s]+)'
        }
        
        for field, pattern in contact_patterns.items():
            match = re.search(pattern, details, re.IGNORECASE)
            if match:
                prospect[field] = match.group(1 if match.groups() else 0).strip()
        
        # Extract location - look for international locations
        location_patterns = [
            r'(?:Paris|London|Berlin|Madrid|Rome|Amsterdam|Brussels|Zurich|Vienna|Stockholm)[^,\n]*',
            r'(?:New York|Toronto|Montreal|Los Angeles|Chicago|Boston)[^,\n]*',
            r'(?:Tokyo|Singapore|Hong Kong|Sydney|Mumbai|Dubai)[^,\n]*',
            r'(?:Johannesburg|Lagos|Nairobi|Casablanca|Cairo)[^,\n]*',
            r'([A-Z][a-z]+,\s*[A-Z][a-z]+)'
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, details, re.IGNORECASE)
            if location_match:
                prospect['location'] = location_match.group(0).strip()
                break
        
        return prospect
    
    def _clean_prospect_data(self, prospect: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate prospect data"""
        cleaned = {}
        
        # Required fields
        if 'company_name' in prospect:
            company_name = str(prospect['company_name']).strip()
            # Remove common prefixes/suffixes that might be parsing artifacts
            company_name = re.sub(r'^(Prospect|Entreprise|Company)\s*\d*[:\s]*', '', company_name, flags=re.IGNORECASE)
            company_name = re.sub(r'\s*[:\-]\s*$', '', company_name)
            
            if len(company_name) > 2:
                cleaned['company_name'] = company_name
        
        # Optional fields with defaults
        cleaned['sector'] = str(prospect.get('sector', 'Non spécifié')).strip()
        cleaned['location'] = str(prospect.get('location', 'Non spécifié')).strip()
        cleaned['description'] = str(prospect.get('description', '')).strip()
        cleaned['website'] = str(prospect.get('website', '')).strip()
        
        # Contact information
        for field in ['contact_name', 'contact_position', 'email', 'phone', 'whatsapp']:
            if field in prospect and prospect[field]:
                cleaned[field] = str(prospect[field]).strip()
        
        # Numeric fields
        try:
            cleaned['quality_score'] = float(prospect.get('quality_score', 5.0))
            if not 0 <= cleaned['quality_score'] <= 10:
                cleaned['quality_score'] = 5.0
        except (ValueError, TypeError):
            cleaned['quality_score'] = 5.0
        
        cleaned['status'] = str(prospect.get('status', 'identified'))
        
        # Extra data
        cleaned['extra_data'] = prospect.get('extra_data', {})
        
        return cleaned