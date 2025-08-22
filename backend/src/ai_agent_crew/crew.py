from crewai import Agent, Crew, Task, Process
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import SerperDevTool, WebsiteSearchTool
import yaml
import os
from typing import Dict, Any

from .tools.custom_tool import (
    GlobalBusinessSearchTool, 
    ContactFinderTool, 
    GlobalMarketAnalysisTool
)

@CrewBase
class AiAgentCrew():
    """AI Agent Prospecting Crew for Ivorian Market"""
    
    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'
    
    def __init__(self):
        # Initialize custom tools
        self.business_search_tool = GlobalBusinessSearchTool()
        self.contact_finder_tool = ContactFinderTool()
        self.market_analysis_tool = GlobalMarketAnalysisTool()
        
        # Initialize web search tools if API keys available
        self.web_tools = []
        if os.getenv('SERPER_API_KEY'):
            self.web_tools.append(SerperDevTool())
        
        self.website_search_tool = WebsiteSearchTool()

    @agent
    def market_researcher(self) -> Agent:
        """Market Researcher Agent"""
        tools = [
            self.business_search_tool,
            self.market_analysis_tool,
            self.website_search_tool
        ] + self.web_tools
        
        return Agent(
            config=self.agents_config['market_researcher'],
            tools=tools,
            verbose=True,
            allow_delegation=False
        )

    @agent  
    def prospecting_specialist(self) -> Agent:
        """Prospecting Specialist Agent"""
        tools = [
            self.contact_finder_tool,
            self.business_search_tool,
            self.website_search_tool
        ] + self.web_tools
        
        return Agent(
            config=self.agents_config['prospecting_specialist'],
            tools=tools,
            verbose=True,
            allow_delegation=False
        )

    @agent
    def content_writer(self) -> Agent:
        """Content Writer Agent"""
        tools = [
            self.website_search_tool
        ] + self.web_tools
        
        return Agent(
            config=self.agents_config['content_writer'],
            tools=tools,
            verbose=True,
            allow_delegation=False
        )

    @task
    def market_research_task(self) -> Task:
        """Market Research Task"""
        return Task(
            config=self.tasks_config['market_research_task'],
            agent=self.market_researcher()
        )

    @task
    def prospect_analysis_task(self) -> Task:
        """Prospect Analysis Task"""
        return Task(
            config=self.tasks_config['prospect_analysis_task'],
            agent=self.prospecting_specialist()
        )

    @task
    def content_creation_task(self) -> Task:
        """Content Creation Task"""
        return Task(
            config=self.tasks_config['content_creation_task'],
            agent=self.content_writer()
        )

    @crew
    def crew(self) -> Crew:
        """Create the AI Agent Prospecting Crew"""
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
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

class ProspectingCrewManager:
    """Manager class for easier crew execution"""
    
    def __init__(self):
        self.crew_instance = AiAgentCrew()
        
    def run_prospecting_campaign(self, inputs: Dict[str, Any]) -> str:
        """
        Run a complete prospecting campaign
        
        Args:
            inputs: Dictionary containing:
                - product: Description du produit/service
                - target_location: Localisation cible (default: "Côte d'Ivoire")
                - target_sectors: Liste des secteurs cibles
                - prospect_count: Nombre de prospects à identifier
                - current_year: Année actuelle
        
        Returns:
            String containing the campaign results
        """
        # Validate inputs
        required_fields = ['product']
        for field in required_fields:
            if field not in inputs:
                raise ValueError(f"Required field '{field}' missing from inputs")
        
        # Set defaults
        inputs.setdefault('target_location', 'France')
        inputs.setdefault('prospect_count', 10)
        inputs.setdefault('current_year', '2025')
        inputs.setdefault('target_sectors', [])
        
        # Run the crew
        crew = self.crew_instance.crew()
        result = crew.kickoff(inputs=inputs)
        
        return str(result)
    
    def get_crew_info(self) -> Dict[str, Any]:
        """Get information about the crew configuration"""
        return {
            "agents": [
                "Global Market Researcher - Identifies potential companies worldwide",
                "International Prospecting Specialist - Finds contact information globally", 
                "Global Content Writer - Creates personalized content for any market"
            ],
            "tools": [
                "Global Business Search - International business directory",
                "Global Contact Finder - Contact information lookup worldwide",
                "Global Market Analysis - Market insights for any country/region",
                "Web Search - General web search capabilities"
            ],
            "process": "Sequential execution of tasks",
            "memory": "Enabled for context retention"
        }