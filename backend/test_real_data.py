#!/usr/bin/env python3
"""Test with your actual CrewAI data"""

import re

# Your actual CrewAI output
REAL_CREWAI_OUTPUT = """
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

4. **Luxury Fashion Group**
   - **Website:** [Luxury Fashion Group](https://www.luxuryfashiongroup.com/)
   - **Contact Information:**
     - None found.
   - **Key Decision Makers:**
     - None identified.
   - **Outreach Strategy:**
     - Generate interest in the group's various brands by showcasing successful collaborations with similar luxury brands.
     - Focus on the advantage of unified marketing strategies across diverse brands within the group.

5. **SSENSE**
   - **Website:** [SSENSE](https://www.ssense.com/)
   - **Contact Information:**
     - None found.
   - **Key Decision Makers:**
     - None identified.
   - **Outreach Strategy:**
     - Propose discussions on leveraging data analytics for personalized marketing strategies.
     - Stress the importance of omnichannel service delivery in the modern luxury retail environment.
"""

def test_with_real_data():
    """Test parser with your actual CrewAI data"""
    print("🎯 Testing with Your Real CrewAI Data")
    print("=" * 60)
    
    # Main pattern for numbered company blocks
    pattern = r'(\d+)\.\s*\*\*([^*]+)\*\*\s*\n(.*?)(?=\n\s*\d+\.\s*\*\*|\Z)'
    matches = list(re.finditer(pattern, REAL_CREWAI_OUTPUT, re.DOTALL | re.IGNORECASE))
    
    print(f"✅ Found {len(matches)} companies from your CrewAI output:")
    print()
    
    prospects_data = []
    
    for match in matches:
        number = match.group(1)
        company_name = match.group(2).strip()
        details_block = match.group(3).strip()
        
        prospect = {
            "company_name": company_name,
            "sector": "E-commerce/Luxury Fashion",
            "quality_score": 85.0,
            "status": "qualified",
            "location": "International"
        }
        
        print(f"🏢 {number}. {company_name}")
        
        # Extract website
        website_match = re.search(r'\[([^\]]+)\]\(([^)]+)\)', details_block)
        if website_match:
            prospect["website"] = website_match.group(2)
            print(f"   🌐 Website: {website_match.group(2)}")
        
        # Extract email
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', details_block)
        if email_match:
            prospect["email"] = email_match.group(1)
            print(f"   📧 Email: {email_match.group(1)}")
        else:
            print(f"   📧 Email: Non trouvé")
        
        # Extract phone
        phone_patterns = [
            r'Phone:\s*\((\d{3})\)\s*(\d{3})-(\d{4})',
            r'Phone:\s*(\d{1}-\d{3}-\d{3}-\d{4})'
        ]
        
        phone_found = False
        for phone_pattern in phone_patterns:
            phone_match = re.search(phone_pattern, details_block)
            if phone_match:
                if len(phone_match.groups()) == 3:
                    prospect["phone"] = f"({phone_match.group(1)}) {phone_match.group(2)}-{phone_match.group(3)}"
                else:
                    prospect["phone"] = phone_match.group(1)
                print(f"   📞 Phone: {prospect['phone']}")
                phone_found = True
                break
        
        if not phone_found:
            print(f"   📞 Phone: Non trouvé")
        
        # Extract key decision makers
        decision_makers = []
        name_patterns = [
            r'-\s*([A-Z][a-z]+\s+[A-Z][a-z]+)\s*-\s*\[LinkedIn\]',
            r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*-\s*\[LinkedIn\]'
        ]
        
        for name_pattern in name_patterns:
            names = re.findall(name_pattern, details_block)
            decision_makers.extend(names)
        
        if decision_makers:
            prospect["contact_name"] = decision_makers[0]
            prospect["contact_position"] = "Decision Maker"
            print(f"   👤 Contact Principal: {decision_makers[0]}")
            if len(decision_makers) > 1:
                print(f"   👥 Autres Contacts: {', '.join(decision_makers[1:])}")
        else:
            print(f"   👤 Contact: À identifier")
        
        # Extract LinkedIn profiles
        linkedin_profiles = re.findall(r'https://www\.linkedin\.com/[^\s\)]+', details_block)
        if linkedin_profiles:
            prospect["extra_data"] = {"linkedin_profiles": linkedin_profiles}
            print(f"   🔗 LinkedIn: {len(linkedin_profiles)} profil(s) trouvé(s)")
        
        print(f"   ⭐ Score: {prospect['quality_score']}/100")
        print(f"   🎯 Status: {prospect['status']}")
        print()
        
        prospects_data.append(prospect)
    
    print("=" * 60)
    print(f"🎉 RÉSULTAT: {len(prospects_data)} prospects prêts à être sauvegardés!")
    print()
    print("💾 Structure des données pour la base de données:")
    for i, prospect in enumerate(prospects_data, 1):
        print(f"  {i}. {prospect['company_name']} - {prospect.get('email', 'Email manquant')} - {prospect.get('phone', 'Tel manquant')}")
    
    return prospects_data

if __name__ == "__main__":
    prospects = test_with_real_data()
    print(f"\n✅ Le parser peut maintenant traiter vos {len(prospects)} prospects CrewAI!")
    print("🚀 Lancez une nouvelle campagne pour voir ces données dans votre interface!")