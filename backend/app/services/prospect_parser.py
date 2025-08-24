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
            
            # Strategy 2: DISABLED - Old parser created too many fragments
            # if not prospects:
            #     prospects.extend(self._extract_company_details(result_text))
            
            # Strategy 3: DISABLED - Fallback created fake prospects  
            # if not prospects:
            #     prospects.extend(self._extract_basic_info(result_text))
            
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
        """Extract prospects from structured CrewAI output with strict validation"""
        prospects = []
        
        # STRICT: Only extract if the text looks like a proper CrewAI report
        if not self._is_valid_crewai_format(text):
            logger.info("Text does not match CrewAI report format, skipping structured extraction")
            return prospects
        
        # Pattern for numbered company blocks (like "1. **Farfetch**")
        pattern = r'(\d+)\.\s*\*\*([^*]+)\*\*\s*\n(.*?)(?=\n\s*\d+\.\s*\*\*|\n\n\n|\Z)'
        matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            company_name = match.group(2).strip()
            details_block = match.group(3).strip()
            
            # Validate that this looks like a real company
            if self._is_valid_company_block(company_name, details_block):
                prospect = self._parse_crewai_company_block(company_name, details_block)
                if prospect and self._is_valid_prospect(prospect):
                    prospects.append(prospect)
        
        # If no numbered pattern found, try alternative patterns but still strict
        if not prospects:
            # Try pattern without numbers: **Company Name**
            pattern = r'\*\*([^*]+)\*\*\s*\n(.*?)(?=\n\s*\*\*|\n\n\n|\Z)'
            matches = re.finditer(pattern, text, re.DOTALL | re.IGNORECASE)
            
            for match in matches:
                company_name = match.group(1).strip()
                details_block = match.group(2).strip()
                
                if self._is_valid_company_block(company_name, details_block):
                    prospect = self._parse_crewai_company_block(company_name, details_block)
                    if prospect and self._is_valid_prospect(prospect):
                        prospects.append(prospect)
        
        return prospects
    
    def _is_valid_crewai_format(self, text: str) -> bool:
        """Check if text looks like a valid CrewAI report"""
        # Must have key indicators of a CrewAI report
        indicators = [
            r'\*\*[^*]+\*\*',  # Bold company names
            r'Website:|Contact Information:|Key Decision Makers:|Outreach Strategy:',  # Section headers
            r'\d+\.\s*\*\*',   # Numbered list with bold names
            r'linkedin\.com|@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # LinkedIn or email patterns
        ]
        
        indicator_count = 0
        for indicator in indicators:
            if re.search(indicator, text, re.IGNORECASE):
                indicator_count += 1
        
        # Need at least 2 indicators to consider it a valid CrewAI format
        return indicator_count >= 2
    
    def _is_valid_company_block(self, company_name: str, details_block: str) -> bool:
        """Validate that a company block looks legitimate"""
        # Company name validation
        if len(company_name) < 2 or len(company_name) > 100:
            return False
        
        # Should not be just fragments or sentences
        invalid_patterns = [
            r'^(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\s',  # Starts with articles/prepositions
            r'^[a-z]',  # Starts with lowercase (fragments usually do)
            r'[.!?]$',  # Ends with sentence punctuation
            r'^\w+\s+(can|will|should|could|would|may|might)',  # Sentence fragments
            r'^(emphasizing|creating|providing|leveraging|focusing)',  # Common fragment starts
        ]
        
        for pattern in invalid_patterns:
            if re.match(pattern, company_name, re.IGNORECASE):
                return False
        
        # Details block should contain relevant business information
        if details_block and len(details_block) > 10:
            # Look for business-related keywords
            business_keywords = [
                'website', 'email', 'phone', 'linkedin', 'contact',
                'company', 'business', 'service', 'solution', 'strategy'
            ]
            
            keyword_count = sum(1 for keyword in business_keywords 
                              if keyword in details_block.lower())
            
            # Should have at least 1 business keyword
            return keyword_count >= 1
        
        # If no details block, company name should look like a real company
        return self._looks_like_company_name(company_name)
    
    def _looks_like_company_name(self, name: str) -> bool:
        """Check if a name looks like a real company name"""
        # Real company indicators
        company_indicators = [
            r'\b(Inc|LLC|Ltd|Limited|Corp|Corporation|SA|SAS|SARL|GmbH|AG|SpA|BV)\b',  # Legal entities
            r'\b(Group|Holdings|International|Global|Solutions|Services|Systems)\b',  # Common suffixes  
            r'\b(Bank|Financial|Tech|Digital|Consulting|Partners)\b',  # Business types
            r'^[A-Z][a-zA-Z0-9\s&-]{1,50}$',  # Proper capitalization, reasonable length
        ]
        
        for indicator in company_indicators:
            if re.search(indicator, name, re.IGNORECASE):
                return True
        
        # Check if it's a known legitimate company pattern (e.g., "Farfetch", "SSENSE")
        if re.match(r'^[A-Z][a-zA-Z-]{2,20}$', name):
            return True
        
        return False
    
    def _is_valid_prospect(self, prospect: Dict[str, Any]) -> bool:
        """Final validation of a parsed prospect"""
        if not prospect.get('company_name'):
            return False
        
        company_name = prospect['company_name']
        
        # Must look like a real company name
        if not self._looks_like_company_name(company_name):
            return False
        
        # Quality score should be reasonable (we set it to 85+ for valid CrewAI prospects)
        quality_score = prospect.get('quality_score', 0)
        if quality_score < 50:  # Too low for CrewAI prospects
            return False
        
        # If we have contact info, it should be valid
        email = prospect.get('email')
        if email and not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return False
        
        return True
    
    def _parse_crewai_company_block(self, company_name: str, details_block: str) -> Dict[str, Any]:
        """Parse a CrewAI company information block"""
        prospect = {
            "company_name": company_name,
            "quality_score": 85.0,  # Higher score for CrewAI found prospects
            "status": "qualified",
            "location": "Non spécifié",
            "sector": "Non spécifié",
            "description": f"Prospect qualifié identifié par les agents IA pour {company_name}"
        }
        
        # Extract website - look for Website: [Text](URL) or - **Website:** URL
        website_patterns = [
            r'(?:\*\*Website:\*\*|Website:|Web:)\s*\[([^\]]+)\]\(([^)]+)\)',
            r'(?:\*\*Website:\*\*|Website:|Web:)\s*([^\n\r]+)',
            r'https?://[^\s\n\r)]+',
        ]
        
        for pattern in website_patterns:
            website_match = re.search(pattern, details_block, re.IGNORECASE)
            if website_match:
                if len(website_match.groups()) >= 2:
                    prospect['website'] = website_match.group(2).strip()
                else:
                    prospect['website'] = website_match.group(1 if website_match.groups() else 0).strip()
                break
        
        # Extract phone numbers
        phone_patterns = [
            r'(?:Phone:|Téléphone:|Tel:)\s*([+]?[\d\s\-\(\)]+)',
            r'Phone:\s*\((\d{3})\)\s*(\d{3})-(\d{4})',
            r'\+?\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4}'
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, details_block, re.IGNORECASE)
            if phone_match:
                if len(phone_match.groups()) > 1:
                    prospect['phone'] = f"({phone_match.group(1)}) {phone_match.group(2)}-{phone_match.group(3)}"
                else:
                    prospect['phone'] = phone_match.group(1 if phone_match.groups() else 0).strip()
                break
        
        # Extract email addresses
        email_pattern = r'(?:Email:|E-mail:)\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
        email_match = re.search(email_pattern, details_block, re.IGNORECASE)
        if email_match:
            prospect['email'] = email_match.group(1).strip()
        else:
            # Look for any email in the text
            general_email = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', details_block)
            if general_email:
                prospect['email'] = general_email.group(1).strip()
        
        # Extract LinkedIn profiles and key decision makers
        linkedin_pattern = r'LinkedIn.*?https://www\.linkedin\.com/[^\s\n\)]+|https://www\.linkedin\.com/[^\s\n\)]+'
        linkedin_matches = re.findall(linkedin_pattern, details_block, re.IGNORECASE)
        
        # Extract contact names from key decision makers section
        contact_names = []
        # Look for patterns like "- Name - [LinkedIn]" or "Name - [LinkedIn]"
        name_patterns = [
            r'(?:-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*-\s*\[LinkedIn\])',
            r'(?:-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*-\s*LinkedIn)',
            r'(\w+\s+\w+)\s*-\s*\[LinkedIn\]'
        ]
        
        for pattern in name_patterns:
            names = re.findall(pattern, details_block)
            contact_names.extend(names)
        
        # Use first found contact as primary contact
        if contact_names:
            prospect['contact_name'] = contact_names[0]
            prospect['contact_position'] = self._guess_position_from_context(details_block, contact_names[0])
        
        # Try to extract location from company context
        location_patterns = [
            r'(?:based|located|headquarters?)\s+(?:in|at)\s+([A-Z][a-zA-Z\s,]+)',
            r'([A-Z][a-z]+,\s*[A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+)?)',
            r'(New York|London|Paris|Berlin|Tokyo|Sydney|Toronto|Munich|Milan|Madrid|Amsterdam|Brussels)'
        ]
        
        for pattern in location_patterns:
            location_match = re.search(pattern, details_block, re.IGNORECASE)
            if location_match:
                prospect['location'] = location_match.group(1).strip()
                break
        
        # Determine sector based on company name and context
        prospect['sector'] = self._determine_sector(company_name, details_block)
        
        # Store additional data
        prospect['extra_data'] = {
            'linkedin_profiles': linkedin_matches,
            'decision_makers': contact_names,
            'raw_details': details_block[:500]  # Store first 500 chars for debugging
        }
        
        return prospect
    
    def _guess_position_from_context(self, context: str, name: str) -> str:
        """Guess position based on context around the name"""
        # Common executive positions
        positions = [
            'CEO', 'CTO', 'CFO', 'CMO', 'COO', 'President', 'Vice President', 'VP',
            'Director', 'Manager', 'Head', 'Lead', 'Chief', 'Senior', 'Principal'
        ]
        
        # Look for position near the name
        name_index = context.lower().find(name.lower())
        if name_index != -1:
            surrounding = context[max(0, name_index-50):name_index+len(name)+50]
            for position in positions:
                if position.lower() in surrounding.lower():
                    return position
        
        return "Decision Maker"  # Default position
    
    def _determine_sector(self, company_name: str, context: str) -> str:
        """Determine company sector based on name and context"""
        sectors_keywords = {
            'E-commerce/Retail': ['fashion', 'retail', 'e-commerce', 'online', 'shopping', 'store'],
            'Technology': ['tech', 'software', 'digital', 'IT', 'platform', 'app'],
            'Finance': ['bank', 'financial', 'finance', 'payment', 'investment'],
            'Healthcare': ['health', 'medical', 'pharma', 'hospital', 'care'],
            'Manufacturing': ['manufacturing', 'production', 'industrial', 'factory'],
            'Media': ['media', 'news', 'broadcasting', 'entertainment'],
            'Education': ['education', 'learning', 'university', 'school'],
            'Real Estate': ['real estate', 'property', 'housing'],
            'Luxury': ['luxury', 'premium', 'high-end', 'exclusive']
        }
        
        combined_text = f"{company_name} {context}".lower()
        
        for sector, keywords in sectors_keywords.items():
            if any(keyword in combined_text for keyword in keywords):
                return sector
        
        return "Services"  # Default sector
    
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