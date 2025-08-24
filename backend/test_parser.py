#!/usr/bin/env python3
"""Test script for the enhanced prospect parser"""

import asyncio
import sys
import os
from pathlib import Path

# Add app to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from app.services.prospect_parser import ProspectParser

# Sample CrewAI output data similar to what you showed
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

async def test_parser():
    """Test the enhanced parser with sample CrewAI output"""
    print("🧪 Testing Enhanced CrewAI Prospect Parser")
    print("=" * 50)
    
    parser = ProspectParser()
    
    try:
        prospects = await parser.parse_crewai_result(SAMPLE_CREWAI_OUTPUT)
        
        print(f"✅ Successfully parsed {len(prospects)} prospects:")
        print()
        
        for i, prospect in enumerate(prospects, 1):
            print(f"📊 Prospect {i}: {prospect.get('company_name', 'Unknown')}")
            print(f"   💼 Sector: {prospect.get('sector', 'N/A')}")
            print(f"   📍 Location: {prospect.get('location', 'N/A')}")
            print(f"   🌐 Website: {prospect.get('website', 'N/A')}")
            print(f"   📧 Email: {prospect.get('email', 'N/A')}")
            print(f"   📞 Phone: {prospect.get('phone', 'N/A')}")
            print(f"   👤 Contact: {prospect.get('contact_name', 'N/A')}")
            print(f"   📋 Position: {prospect.get('contact_position', 'N/A')}")
            print(f"   ⭐ Score: {prospect.get('quality_score', 0)}/100")
            print(f"   🎯 Status: {prospect.get('status', 'N/A')}")
            
            if prospect.get('extra_data', {}).get('decision_makers'):
                print(f"   👥 Decision Makers: {', '.join(prospect['extra_data']['decision_makers'])}")
            
            print()
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing parser: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_parser())
    if success:
        print("🎉 Parser test completed successfully!")
        print("💡 The enhanced parser can now handle your CrewAI output format.")
        print("🚀 Run a new campaign to see the prospects appear on your dashboard!")
    else:
        print("💥 Parser test failed. Check the errors above.")
    
    sys.exit(0 if success else 1)