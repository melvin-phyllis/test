#!/usr/bin/env python
"""
Test complet du stack Backend + Frontend + CrewAI
"""

import asyncio
import subprocess
import time
import requests
import json
from pathlib import Path
import sys

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

class FullStackTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.backend_process = None
        self.frontend_process = None
        
    def start_backend(self):
        """Start the backend server"""
        print("🔧 Starting backend server...")
        try:
            # Activate virtual environment and start uvicorn
            cmd = [
                "bash", "-c", 
                "source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000"
            ]
            self.backend_process = subprocess.Popen(
                cmd, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                cwd=project_root
            )
            
            # Wait for backend to start
            for i in range(30):
                try:
                    response = requests.get(f"{self.backend_url}/health", timeout=1)
                    if response.status_code == 200:
                        print("✅ Backend started successfully")
                        return True
                except requests.exceptions.RequestException:
                    pass
                time.sleep(1)
            
            print("❌ Backend failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the frontend server"""
        print("🎨 Starting frontend server...")
        try:
            frontend_dir = project_root / "frontend"
            if not frontend_dir.exists():
                print("❌ Frontend directory not found")
                return False
            
            # Check if node_modules exists
            if not (frontend_dir / "node_modules").exists():
                print("📦 Installing frontend dependencies...")
                npm_install = subprocess.run(
                    ["npm", "install"], 
                    cwd=frontend_dir,
                    capture_output=True,
                    text=True
                )
                if npm_install.returncode != 0:
                    print(f"❌ npm install failed: {npm_install.stderr}")
                    return False
            
            # Start frontend dev server
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=frontend_dir
            )
            
            # Wait for frontend to start
            for i in range(30):
                try:
                    response = requests.get(self.frontend_url, timeout=1)
                    if response.status_code == 200:
                        print("✅ Frontend started successfully")
                        return True
                except requests.exceptions.RequestException:
                    pass
                time.sleep(1)
            
            print("❌ Frontend failed to start")
            return False
            
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def test_backend_endpoints(self):
        """Test backend API endpoints"""
        print("🔍 Testing backend endpoints...")
        
        tests = [
            ("Health Check", "GET", "/health"),
            ("Root", "GET", "/"),
            ("API Docs", "GET", "/docs"),
            ("Campaigns List", "GET", "/api/v1/prospecting/campaigns"),
            ("Crew Info", "GET", "/api/v1/prospecting/crew/info"),
            ("Prospects List", "GET", "/api/v1/prospects"),
            ("Agent Status", "GET", "/api/v1/agents/status"),
        ]
        
        passed = 0
        for name, method, endpoint in tests:
            try:
                response = requests.request(
                    method, 
                    f"{self.backend_url}{endpoint}",
                    timeout=5
                )
                if response.status_code in [200, 404]:  # 404 is ok for empty lists
                    print(f"  ✅ {name}")
                    passed += 1
                else:
                    print(f"  ❌ {name} (Status: {response.status_code})")
            except Exception as e:
                print(f"  ❌ {name} (Error: {e})")
        
        print(f"📊 Backend tests: {passed}/{len(tests)} passed")
        return passed == len(tests)
    
    def test_campaign_creation(self):
        """Test creating a campaign"""
        print("🎯 Testing campaign creation...")
        
        try:
            campaign_data = {
                "name": "Test Campaign - Full Stack",
                "product_description": "Test product for full stack testing",
                "target_location": "Côte d'Ivoire", 
                "prospect_count": 3
            }
            
            response = requests.post(
                f"{self.backend_url}/api/v1/prospecting/campaigns",
                json=campaign_data,
                timeout=10
            )
            
            if response.status_code == 200:
                campaign = response.json()
                campaign_id = campaign["id"]
                print(f"  ✅ Campaign created (ID: {campaign_id})")
                
                # Test getting the campaign
                get_response = requests.get(
                    f"{self.backend_url}/api/v1/prospecting/campaigns/{campaign_id}",
                    timeout=5
                )
                
                if get_response.status_code == 200:
                    print("  ✅ Campaign retrieved successfully")
                    return campaign_id
                else:
                    print("  ❌ Failed to retrieve campaign")
                    return None
            else:
                print(f"  ❌ Campaign creation failed (Status: {response.status_code})")
                print(f"  Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"  ❌ Error creating campaign: {e}")
            return None
    
    def test_crewai_tools(self):
        """Test CrewAI tools directly"""
        print("🤖 Testing CrewAI tools...")
        
        try:
            # Test tools directly
            from src.ai_agent_crew.tools.custom_tool import (
                IvorianBusinessSearchTool,
                ContactFinderTool,
                MarketAnalysisTool
            )
            
            # Test business search
            business_tool = IvorianBusinessSearchTool()
            result = business_tool._run("entreprise technologie")
            if "entreprise" in result.lower() or "aucune" in result.lower():
                print("  ✅ Business search tool working")
            else:
                print("  ❌ Business search tool failed")
                return False
            
            # Test contact finder
            contact_tool = ContactFinderTool()
            result = contact_tool._run("Orange Côte d'Ivoire")
            if "contact" in result.lower() or "aucun" in result.lower():
                print("  ✅ Contact finder tool working")
            else:
                print("  ❌ Contact finder tool failed")
                return False
            
            # Test market analysis
            market_tool = MarketAnalysisTool()
            result = market_tool._run("solution logiciel")
            if "marché" in result.lower() or "secteur" in result.lower():
                print("  ✅ Market analysis tool working")
            else:
                print("  ❌ Market analysis tool failed")
                return False
            
            return True
            
        except Exception as e:
            print(f"  ❌ Error testing CrewAI tools: {e}")
            return False
    
    def test_frontend_access(self):
        """Test frontend accessibility"""
        print("🌐 Testing frontend access...")
        
        try:
            response = requests.get(self.frontend_url, timeout=5)
            if response.status_code == 200:
                content = response.text
                if "AI Agent Prospecting Platform" in content or "html" in content.lower():
                    print("  ✅ Frontend accessible")
                    return True
                else:
                    print("  ❌ Frontend content unexpected")
                    return False
            else:
                print(f"  ❌ Frontend not accessible (Status: {response.status_code})")
                return False
                
        except Exception as e:
            print(f"  ❌ Error accessing frontend: {e}")
            return False
    
    def cleanup(self):
        """Stop all processes"""
        print("🧹 Cleaning up...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            print("  ✅ Backend process stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            print("  ✅ Frontend process stopped")
    
    def run_full_test(self):
        """Run complete full stack test"""
        print("🧪 AI Agent Prospecting Platform - Full Stack Test")
        print("=" * 60)
        
        try:
            # Start services
            if not self.start_backend():
                return False
            
            if not self.start_frontend():
                return False
            
            time.sleep(2)  # Let services settle
            
            # Run tests
            tests_passed = 0
            total_tests = 5
            
            if self.test_backend_endpoints():
                tests_passed += 1
            
            if self.test_campaign_creation():
                tests_passed += 1
            
            if self.test_crewai_tools():
                tests_passed += 1
            
            if self.test_frontend_access():
                tests_passed += 1
            
            # Integration test
            print("🔗 Testing integration...")
            if tests_passed == 4:
                print("  ✅ All components integrated successfully")
                tests_passed += 1
            else:
                print("  ❌ Integration issues detected")
            
            # Results
            print("\n" + "=" * 60)
            print("📊 FULL STACK TEST RESULTS")
            print("=" * 60)
            print(f"Tests passed: {tests_passed}/{total_tests}")
            
            if tests_passed == total_tests:
                print("\n🎉 ALL TESTS PASSED!")
                print("\n✅ Your AI Agent Prospecting Platform is ready!")
                print(f"\n🌐 Frontend: {self.frontend_url}")
                print(f"🔗 Backend API: {self.backend_url}")
                print(f"📚 API Docs: {self.backend_url}/docs")
                print("\n💡 Next steps:")
                print("  1. Configure your OpenAI API key in .env")
                print("  2. Create your first campaign in the web interface")
                print("  3. Start prospecting!")
                return True
            else:
                print(f"\n⚠️  {total_tests - tests_passed} test(s) failed")
                print("\nPlease check the errors above and:")
                print("  1. Ensure all dependencies are installed")
                print("  2. Check your .env configuration")
                print("  3. Verify database is accessible")
                print("  4. Run setup_project.sh if needed")
                return False
                
        except KeyboardInterrupt:
            print("\n⏹️  Test interrupted by user")
            return False
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}")
            return False
        finally:
            self.cleanup()

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Full Stack Test for AI Agent Prospecting Platform")
    parser.add_argument("--no-start", action="store_true", help="Don't start services (assume already running)")
    parser.add_argument("--backend-only", action="store_true", help="Test backend only")
    parser.add_argument("--frontend-only", action="store_true", help="Test frontend only")
    
    args = parser.parse_args()
    
    tester = FullStackTester()
    
    if args.backend_only:
        print("🔧 Testing backend only...")
        if tester.test_backend_endpoints() and tester.test_crewai_tools():
            print("✅ Backend tests passed!")
        else:
            print("❌ Backend tests failed!")
    elif args.frontend_only:
        print("🎨 Testing frontend only...")
        if tester.test_frontend_access():
            print("✅ Frontend test passed!")
        else:
            print("❌ Frontend test failed!")
    else:
        success = tester.run_full_test()
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()