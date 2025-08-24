from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool, WebsiteSearchTool
import yaml
import os
from typing import Dict, Any, List
from datetime import datetime
import asyncio

from .tools.custom_tool import (
    GlobalBusinessSearchTool, 
    ContactFinderTool, 
    GlobalMarketAnalysisTool
)


class DynamicProspectingCrewManager:
    """Enhanced Crew Manager that dynamically configures agents based on campaign type"""
    
    def __init__(self, websocket_callback=None, campaign_id=None):
        self.websocket_callback = websocket_callback
        self.campaign_id = campaign_id
        
        # Initialize tools
        self.business_search_tool = GlobalBusinessSearchTool()
        self.contact_finder_tool = ContactFinderTool()
        self.market_analysis_tool = GlobalMarketAnalysisTool()
        self.website_search_tool = WebsiteSearchTool()
        
        # Web tools (conditional)
        self.web_tools = []
        if os.getenv('SERPER_API_KEY'):
            self.web_tools.append(SerperDevTool())
    
    async def send_websocket_message(self, message_type: str, data: Dict[str, Any]):
        """Send WebSocket message if callback is available"""
        if self.websocket_callback:
            try:
                message = {
                    "type": message_type,
                    "data": data,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                if self.campaign_id:
                    await self.websocket_callback(self.campaign_id, message)
                
                try:
                    from app.services.websocket_manager import manager
                    await manager.broadcast(message)
                except Exception as broadcast_error:
                    print(f"Error broadcasting globally: {broadcast_error}")
                    
            except Exception as e:
                print(f"Error sending WebSocket message: {e}")
    
    def get_agent_config_for_type(self, campaign_type: str, agents_config: Dict[str, bool]) -> Dict[str, Any]:
        """Get agent configuration based on campaign type and user preferences"""
        base_config = {
            'lead-generation': {
                'agents': ['market_researcher', 'prospecting_specialist', 'outreach_specialist'],
                'focus': 'Finding and contacting potential customers',
                'tools_priority': ['business_search', 'contact_finder']
            },
            'market-research': {
                'agents': ['market_researcher', 'analyst'],
                'focus': 'Understanding market trends and opportunities', 
                'tools_priority': ['market_analysis', 'business_search']
            },
            'competitor-analysis': {
                'agents': ['market_researcher', 'analyst', 'intelligence_specialist'],
                'focus': 'Analyzing competitors and market positioning',
                'tools_priority': ['business_search', 'market_analysis', 'web_search']
            },
            'partnership': {
                'agents': ['market_researcher', 'partnership_specialist'],
                'focus': 'Finding potential business partners and collaboration opportunities',
                'tools_priority': ['business_search', 'contact_finder']
            },
            'recruitment': {
                'agents': ['talent_researcher', 'recruitment_specialist'],
                'focus': 'Finding and evaluating potential candidates',
                'tools_priority': ['business_search', 'contact_finder']
            }
        }
        
        return base_config.get(campaign_type, base_config['lead-generation'])
    
    def create_dynamic_agents(self, campaign_type: str, agents_config: Dict[str, bool], inputs: Dict[str, Any]) -> List[Agent]:
        """Create agents dynamically based on campaign configuration"""
        agents = []
        config = self.get_agent_config_for_type(campaign_type, agents_config)
        
        # Market Researcher - always included
        if agents_config.get('researcher', True):
            tools = [self.business_search_tool, self.market_analysis_tool, self.website_search_tool] + self.web_tools
            agents.append(Agent(
                role="Global Market Researcher",
                goal=f"Research and identify potential prospects in {inputs.get('target_location', 'Global')} for {campaign_type}",
                backstory=f"""You are an expert market researcher specializing in {campaign_type}. 
                You excel at finding businesses and opportunities that match specific criteria. 
                Focus: {config['focus']}""",
                tools=tools,
                verbose=True,
                allow_delegation=False
            ))
        
        # Analyst - for data analysis campaigns
        if agents_config.get('analyst', True):
            tools = [self.market_analysis_tool, self.business_search_tool] + self.web_tools
            agents.append(Agent(
                role="Business Intelligence Analyst", 
                goal=f"Analyze market data and provide insights for {campaign_type} campaigns",
                backstory=f"""You are a business intelligence analyst who specializes in {campaign_type}.
                You analyze data to provide actionable insights and recommendations.
                You work with the market researcher to qualify and score potential prospects.""",
                tools=tools,
                verbose=True,
                allow_delegation=False
            ))
        
        # Outreach Specialist - for lead generation
        if agents_config.get('outreach', False) and campaign_type == 'lead-generation':
            tools = [self.contact_finder_tool, self.website_search_tool] + self.web_tools
            agents.append(Agent(
                role="Outreach Specialist",
                goal="Find contact information and prepare outreach strategies for qualified prospects",
                backstory="""You are an outreach specialist who excels at finding contact information 
                and preparing personalized outreach strategies. You work with qualified prospects 
                to ensure high-quality contact data.""",
                tools=tools,
                verbose=True,
                allow_delegation=False
            ))
        
        return agents
    
    def create_dynamic_tasks(self, agents: List[Agent], campaign_type: str, inputs: Dict[str, Any]) -> List[Task]:
        """Create tasks dynamically based on agents and campaign type"""
        tasks = []
        
        # Market Research Task - always first
        if agents:
            market_research_task = Task(
                description=f"""
                Research the {inputs.get('target_location', 'global')} market for {campaign_type} opportunities.
                
                Target sectors: {', '.join(inputs.get('target_sectors', []))}
                Target positions: {', '.join(inputs.get('target_positions', []))}
                Product/Service: {inputs.get('product', '')}
                Prospect count: {inputs.get('prospect_count', 10)}
                
                Focus on:
                1. Identifying companies that match the target criteria
                2. Understanding their business models and needs
                3. Evaluating their potential as prospects
                4. Gathering basic company information
                
                Expected Output: A detailed report with identified companies and their potential.
                """,
                agent=agents[0],
                expected_output="Detailed market research report with identified prospects"
            )
            tasks.append(market_research_task)
        
        # Analysis Task - if analyst agent exists
        if len(agents) > 1 and any(agent.role == "Business Intelligence Analyst" for agent in agents):
            analyst_agent = next(agent for agent in agents if agent.role == "Business Intelligence Analyst")
            analysis_task = Task(
                description=f"""
                Analyze the market research findings and provide detailed insights for {campaign_type}.
                
                Your analysis should include:
                1. Scoring and ranking of identified prospects
                2. Market insights and trends
                3. Competitive landscape analysis
                4. Recommendations for approach strategies
                5. Risk assessment and opportunity evaluation
                
                Context: {inputs.get('product', '')}
                Priority level: {inputs.get('priority', 'medium')}
                Aggressiveness level: {inputs.get('aggressiveness', 50)}%
                
                Expected Output: Comprehensive analysis report with scored prospects and strategic recommendations.
                """,
                agent=analyst_agent,
                expected_output="Analysis report with prospect scoring and strategic recommendations",
                context=[market_research_task]
            )
            tasks.append(analysis_task)
        
        # Outreach Task - if outreach agent exists
        outreach_agents = [agent for agent in agents if agent.role == "Outreach Specialist"]
        if outreach_agents and campaign_type == 'lead-generation':
            outreach_task = Task(
                description=f"""
                Find detailed contact information for the top-qualified prospects and prepare outreach strategies.
                
                For each qualified prospect:
                1. Find contact information (email, phone, LinkedIn)
                2. Identify key decision makers
                3. Prepare personalized outreach approach
                4. Create contact timeline recommendations
                
                Daily contact limit: {inputs.get('daily_limit', 20)}
                Use advanced search: {inputs.get('use_serper', True)}
                
                Expected Output: Complete contact database with outreach strategies.
                """,
                agent=outreach_agents[0],
                expected_output="Contact database with detailed information and outreach strategies",
                context=tasks  # Use all previous tasks as context
            )
            tasks.append(outreach_task)
        
        return tasks
    
    def run_prospecting_campaign(self, inputs: Dict[str, Any]) -> str:
        """Run a dynamically configured prospecting campaign"""
        
        # Validate inputs
        required_fields = ['product']
        for field in required_fields:
            if field not in inputs:
                raise ValueError(f"Required field '{field}' missing from inputs")
        
        # Set defaults
        inputs.setdefault('target_location', 'Global')
        inputs.setdefault('prospect_count', 10)
        inputs.setdefault('current_year', '2025')
        inputs.setdefault('target_sectors', [])
        inputs.setdefault('campaign_type', 'lead-generation')
        inputs.setdefault('agents_config', {'researcher': True, 'analyst': True})
        
        campaign_type = inputs.get('campaign_type', 'lead-generation')
        agents_config = inputs.get('agents_config', {})
        
        # Notify start
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(self.send_websocket_message("agent_activity", {
                "agent_name": "Campaign Manager",
                "action": f"Initialisation campagne {campaign_type}",
                "description": f"Configuration des agents pour {campaign_type} - {inputs['prospect_count']} prospects ciblés",
                "status": "started",
                "campaign_id": self.campaign_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
        except:
            pass
        
        # Create dynamic agents and tasks
        agents = self.create_dynamic_agents(campaign_type, agents_config, inputs)
        tasks = self.create_dynamic_tasks(agents, campaign_type, inputs)
        
        if not agents or not tasks:
            raise ValueError("No agents or tasks configured for this campaign type")
        
        # Notify agents configured
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(self.send_websocket_message("agent_activity", {
                "agent_name": "Campaign Manager",
                "action": "Agents configurés",
                "description": f"{len(agents)} agents activés: {', '.join([agent.role for agent in agents])}",
                "status": "configured",
                "campaign_id": self.campaign_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
        except:
            pass
        
        # Create and run crew
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
            memory=True,
            embedder={
                "provider": "openai",
                "config": {
                    "model": "text-embedding-3-small"
                }
            }
        )
        
        # Notify execution start
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(self.send_websocket_message("agent_activity", {
                "agent_name": agents[0].role if agents else "Unknown Agent",
                "action": "Exécution démarrée",
                "description": f"Les agents CrewAI travaillent sur la campagne {campaign_type}",
                "status": "executing",
                "campaign_id": self.campaign_id,
                "timestamp": datetime.utcnow().isoformat()
            }))
        except:
            pass
        
        # Execute crew
        result = crew.kickoff(inputs=inputs)
        
        # Notify completion
        try:
            loop = asyncio.get_event_loop()
            loop.run_until_complete(self.send_websocket_message("agent_activity", {
                "agent_name": "Campaign Manager",
                "action": "Campagne terminée",
                "description": f"Campagne {campaign_type} terminée avec succès - Prospects identifiés",
                "status": "completed",
                "campaign_id": self.campaign_id,
                "result": "Campagne exécutée avec succès",
                "timestamp": datetime.utcnow().isoformat()
            }))
        except:
            pass
        
        return str(result)
    
    def get_crew_info(self) -> Dict[str, Any]:
        """Get information about dynamic crew capabilities"""
        return {
            "campaign_types": [
                "lead-generation - Generate qualified leads for sales",
                "market-research - Research market opportunities and trends", 
                "competitor-analysis - Analyze competitors and market position",
                "partnership - Find potential business partners",
                "recruitment - Find and evaluate candidates"
            ],
            "available_agents": [
                "Global Market Researcher - Market research and prospect identification",
                "Business Intelligence Analyst - Data analysis and insights", 
                "Outreach Specialist - Contact finding and outreach strategies",
                "Partnership Specialist - Partnership opportunity identification",
                "Talent Researcher - Candidate research and evaluation"
            ],
            "dynamic_configuration": "Agents and tasks are configured based on campaign type and preferences",
            "tools": [
                "Global Business Search - International business directory",
                "Contact Finder - Global contact information lookup",
                "Market Analysis - Market insights and trends analysis",
                "Web Search - Advanced web search capabilities"
            ]
        }