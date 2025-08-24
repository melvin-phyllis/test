#!/usr/bin/env python
"""
Test script for AI Agent Prospecting Platform installation
"""

import asyncio
import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

async def test_database_connection():
    """Test database connection"""
    try:
        from app.core.database import engine, Base
        
        print("🔗 Testing database connection...")
        
        async with engine.begin() as conn:
            # Test basic connection
            result = await conn.execute("SELECT 1")
            assert result.scalar() == 1
            print("✅ Database connection successful")
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Database tables created")
            
        return True
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

async def test_crewai_import():
    """Test CrewAI imports"""
    try:
        print("📦 Testing CrewAI imports...")
        
        from src.ai_agent_crew.crew import AiAgentCrew, ProspectingCrewManager
        from src.ai_agent_crew.tools.custom_tool import IvorianBusinessSearchTool
        
        print("✅ CrewAI imports successful")
        
        # Test tool instantiation
        tool = IvorianBusinessSearchTool()
        print("✅ Custom tools instantiation successful")
        
        # Test crew manager
        manager = ProspectingCrewManager()
        info = manager.get_crew_info()
        print(f"✅ Crew manager created: {len(info['agents'])} agents configured")
        
        return True
    except Exception as e:
        print(f"❌ CrewAI import test failed: {e}")
        return False

async def test_fastapi_endpoints():
    """Test FastAPI application"""
    try:
        print("🚀 Testing FastAPI application...")
        
        from app.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        # Test health endpoint
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        print("✅ Health endpoint working")
        
        # Test prospecting health endpoint
        response = client.get("/api/v1/prospecting/health")
        assert response.status_code == 200
        print("✅ Prospecting endpoints accessible")
        
        # Test crew info endpoint
        response = client.get("/api/v1/prospecting/crew/info")
        assert response.status_code == 200
        crew_info = response.json()
        print(f"✅ Crew info endpoint: {len(crew_info.get('agents', []))} agents configured")
        
        return True
    except Exception as e:
        print(f"❌ FastAPI test failed: {e}")
        return False

async def test_campaign_creation():
    """Test campaign creation"""
    try:
        print("📋 Testing campaign creation...")
        
        from app.main import app
        from fastapi.testclient import TestClient
        
        client = TestClient(app)
        
        campaign_data = {
            "name": "Test Campaign",
            "product_description": "Test product for AI prospecting",
            "target_location": "Côte d'Ivoire",
            "prospect_count": 3
        }
        
        response = client.post("/api/v1/prospecting/campaigns", json=campaign_data)
        assert response.status_code == 200
        
        campaign = response.json()
        assert campaign["name"] == "Test Campaign"
        assert campaign["status"] == "pending"
        
        campaign_id = campaign["id"]
        print(f"✅ Campaign created successfully (ID: {campaign_id})")
        
        # Test getting campaign
        response = client.get(f"/api/v1/prospecting/campaigns/{campaign_id}")
        assert response.status_code == 200
        print("✅ Campaign retrieval working")
        
        return True
    except Exception as e:
        print(f"❌ Campaign creation test failed: {e}")
        return False

async def test_environment_setup():
    """Test environment configuration"""
    try:
        print("⚙️  Testing environment setup...")
        
        from app.core.config import settings
        
        # Check required settings
        required_settings = ['PROJECT_NAME', 'VERSION', 'API_V1_STR']
        for setting in required_settings:
            value = getattr(settings, setting)
            assert value is not None
            print(f"✅ {setting}: {value}")
        
        # Check optional API keys
        if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY:
            if settings.OPENAI_API_KEY.startswith('sk-'):
                print("✅ OpenAI API key configured")
            else:
                print("⚠️  OpenAI API key may not be valid")
        else:
            print("⚠️  OpenAI API key not configured (required for production)")
        
        return True
    except Exception as e:
        print(f"❌ Environment test failed: {e}")
        return False

async def run_all_tests():
    """Run all tests"""
    print("🧪 AI Agent Prospecting Platform - Installation Test")
    print("=" * 60)
    
    tests = [
        ("Environment Setup", test_environment_setup),
        ("Database Connection", test_database_connection),
        ("CrewAI Import", test_crewai_import),
        ("FastAPI Endpoints", test_fastapi_endpoints),
        ("Campaign Creation", test_campaign_creation),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name} test...")
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Installation is successful.")
        print("\n📚 Next steps:")
        print("1. Copy .env.example to .env and configure your API keys")
        print("2. Run: uvicorn app.main:app --reload")
        print("3. Visit: http://localhost:8000/docs for API documentation")
        print("4. Create a campaign and start prospecting!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please check the errors above.")
        print("Make sure all dependencies are installed and configured properly.")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(run_all_tests())
    sys.exit(0 if success else 1)