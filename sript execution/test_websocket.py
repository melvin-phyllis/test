#!/usr/bin/env python3
"""
Test script pour les WebSockets du backend
"""
import asyncio
import websockets
import json
import sys

async def test_websocket():
    uri = "ws://127.0.0.1:8001/ws/campaign/1"
    
    try:
        print(f"Connexion à {uri}...")
        async with websockets.connect(uri) as websocket:
            print("✅ Connexion WebSocket établie!")
            
            # Écouter les messages pendant 10 secondes
            print("🔄 Écoute des messages WebSocket (10 secondes)...")
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                data = json.loads(message)
                print(f"📩 Message reçu: {data}")
            except asyncio.TimeoutError:
                print("⏰ Aucun message reçu dans les 10 secondes")
            
            print("✅ Test WebSocket terminé avec succès")
            
    except ConnectionRefusedError:
        print("❌ Impossible de se connecter au WebSocket")
        return False
    except Exception as e:
        print(f"❌ Erreur WebSocket: {e}")
        return False
    
    return True

if __name__ == "__main__":
    result = asyncio.run(test_websocket())
    sys.exit(0 if result else 1)