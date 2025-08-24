#!/usr/bin/env python3
"""Simple test for CrewAI parser regex patterns"""

import re

# Sample CrewAI output data
SAMPLE_CREWAI_OUTPUT = """
1. **Farfetch**
   - **Website:** [Farfetch](https://www.farfetch.com/)
   - **Contact Information:**
     - LinkedIn: [Farfetch LinkedIn](https://www.linkedin.com/company/farfetch.com)
     - Customer Service Email: customercare@farfetch.com
     - Phone: (646) 791-3768
   - **Key Decision Makers:**
     - Joshua Dent - [LinkedIn](https://www.linkedin.com/in/dentjoshua)
     - Christine Mou - [LinkedIn](https://www.linkedin.com/in/christinemou)

2. **Mytheresa**
   - **Website:** [Mytheresa](https://www.mytheresa.com/)
   - **Contact Information:**
     - LinkedIn: [Mytheresa LinkedIn](https://www.linkedin.com/company/mytheresa-com)
     - Customer Service Phone: 1-888-550-9675
   - **Key Decision Makers:**
     - Aaron Alexander - [LinkedIn](https://www.linkedin.com/in/aaron-alexander-1b7b185a)
     - Jessica Amodio - [LinkedIn](https://www.linkedin.com/in/jessica-amodio-b5110961)
"""

def test_regex_patterns():
    """Test regex patterns for CrewAI parsing"""
    print("🧪 Testing CrewAI Parser Regex Patterns")
    print("=" * 50)
    
    # Test main pattern for numbered company blocks
    pattern = r'(\d+)\.\s*\*\*([^*]+)\*\*\s*\n(.*?)(?=\n\s*\d+\.\s*\*\*|\n\n\n|\Z)'
    matches = list(re.finditer(pattern, SAMPLE_CREWAI_OUTPUT, re.DOTALL | re.IGNORECASE))
    
    print(f"✅ Found {len(matches)} companies using numbered pattern:")
    
    for match in matches:
        number = match.group(1)
        company_name = match.group(2).strip()
        details_block = match.group(3).strip()
        
        print(f"\n📊 Company {number}: {company_name}")
        
        # Test website extraction
        website_patterns = [
            r'(?:\*\*Website:\*\*|Website:|Web:)\s*\[([^\]]+)\]\(([^)]+)\)',
            r'(?:\*\*Website:\*\*|Website:|Web:)\s*([^\n\r]+)',
            r'https?://[^\s\n\r)]+',
        ]
        
        website = None
        for wp in website_patterns:
            website_match = re.search(wp, details_block, re.IGNORECASE)
            if website_match:
                if len(website_match.groups()) >= 2:
                    website = website_match.group(2).strip()
                else:
                    website = website_match.group(1 if website_match.groups() else 0).strip()
                break
        
        print(f"   🌐 Website: {website}")
        
        # Test email extraction
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', details_block)
        if email_match:
            print(f"   📧 Email: {email_match.group(1)}")
        
        # Test phone extraction
        phone_match = re.search(r'\((\d{3})\)\s*(\d{3})-(\d{4})', details_block)
        if phone_match:
            print(f"   📞 Phone: ({phone_match.group(1)}) {phone_match.group(2)}-{phone_match.group(3)}")
        else:
            phone_match = re.search(r'(\d{1}-\d{3}-\d{3}-\d{4})', details_block)
            if phone_match:
                print(f"   📞 Phone: {phone_match.group(1)}")
        
        # Test name extraction
        name_patterns = [
            r'(?:-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*-\s*\[LinkedIn\])',
            r'(?:-\s*)?([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*-\s*LinkedIn)',
        ]
        
        names = []
        for np in name_patterns:
            names.extend(re.findall(np, details_block))
        
        if names:
            print(f"   👤 Key Contacts: {', '.join(names)}")
        
        print(f"   📋 Details Preview: {details_block[:100]}...")

if __name__ == "__main__":
    test_regex_patterns()
    print("\n🎉 Regex pattern testing completed!")
    print("💡 The patterns should work with your CrewAI output format.")