from fastapi import WebSocket
from typing import List, Dict, Optional
import json
import asyncio
from datetime import datetime

from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class ConnectionManager:
    def __init__(self):
        # Active connections by campaign_id
        self.campaign_connections: Dict[int, List[WebSocket]] = {}
        # All active connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, campaign_id: Optional[int] = None):
        """Connect a client to WebSocket"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        if campaign_id:
            if campaign_id not in self.campaign_connections:
                self.campaign_connections[campaign_id] = []
            self.campaign_connections[campaign_id].append(websocket)
            logger.info(f"Client connected to campaign {campaign_id}")

    def disconnect(self, websocket: WebSocket, campaign_id: Optional[int] = None):
        """Disconnect a client from WebSocket"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        if campaign_id and campaign_id in self.campaign_connections:
            if websocket in self.campaign_connections[campaign_id]:
                self.campaign_connections[campaign_id].remove(websocket)
                
            # Remove empty campaign connection lists
            if not self.campaign_connections[campaign_id]:
                del self.campaign_connections[campaign_id]
                
        logger.info(f"Client disconnected from campaign {campaign_id}")

    async def broadcast_to_campaign(self, campaign_id: int, message: dict):
        """Broadcast message to all clients connected to specific campaign"""
        if campaign_id not in self.campaign_connections:
            return
            
        connections = self.campaign_connections[campaign_id].copy()
        disconnected = []
        
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to campaign {campaign_id}: {e}")
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection, campaign_id)

    def get_total_connection_count(self) -> int:
        """Get total number of active connections"""
        return len(self.active_connections)

# Global instance
manager = ConnectionManager()