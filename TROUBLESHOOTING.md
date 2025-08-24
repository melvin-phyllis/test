# 🔧 Guide de Résolution des Problèmes

## 🚨 **Problèmes Résolus**

### **1. Erreur Shell Fish avec venv**
**Problème :** `venv/bin/activate (ligne 48) : Usage de '=' non supporté. Dans fish, veuillez utiliser 'set _OLD_VIRTUAL_PATH "$PATH"'.`

**Solution :** Utiliser `bash` au lieu de `fish` pour l'activation de l'environnement virtuel :
```bash
bash -c "source venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
```

### **2. pnpm Non Installé**
**Problème :** `La commande « pnpm » n'est pas trouvée`

**Solution :** Installer pnpm globalement :
```bash
npm install -g pnpm
```

### **3. Fichiers .env Manquants**
**Problème :** Variables d'environnement non configurées

**Solution :** Créer les fichiers de configuration :
- **Backend :** `backend/.env` (copié depuis `env_config.txt`)
- **Frontend :** `frontend/.env.local` (copié depuis `env_frontend.txt`)

### **4. Erreurs de Routage Frontend**
**Problème :** Routes `/app/dashboard` non trouvées (erreur 404)

**Solution :** Corriger tous les liens vers `/dashboard` (sans `/app/`)

## 🛠️ **Scripts de Démarrage**

### **Démarrage Automatique**
```bash
# Démarrer tous les services
./scripts/start_services.sh

# Arrêter tous les services
./scripts/stop_services.sh
```

### **Démarrage Manuel**
```bash
# Terminal 1 - Backend
cd backend
bash -c "source venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

## 📋 **Configuration Requise**

### **Backend (.env)**
```bash
# Clés API (OBLIGATOIRES)
OPENAI_API_KEY=sk-votre-vraie-cle-api-openai
SERPER_API_KEY=votre-cle-serper

# Sécurité
SECRET_KEY=votre-cle-secrete-jwt
```

### **Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 🔍 **Vérification des Services**

### **Test Backend**
```bash
curl http://localhost:8000/api/v1/system/health
# Réponse attendue: {"status":"healthy","service":"ai_prospecting_api","version":"1.0.0"}
```

### **Test Frontend**
```bash
curl http://localhost:3001/
# Doit retourner la page d'accueil HTML
```

## 🚀 **Démarrage Rapide**

1. **Configurer les clés API** dans `backend/.env`
2. **Exécuter le script de démarrage** : `./scripts/start_services.sh`
3. **Accéder à l'application** : http://localhost:3001

## 📚 **Documentation API**

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🆘 **En Cas de Problème**

1. **Vérifier les logs** : `tail -f backend/logs/app.log`
2. **Redémarrer les services** : `./scripts/stop_services.sh && ./scripts/start_services.sh`
3. **Vérifier les processus** : `ps aux | grep -E "(uvicorn|next)"`
4. **Vérifier les ports** : `netstat -tlnp | grep -E "(8000|3001)"`

## ✅ **Statut des Services**

| Service | Port | Statut | Test |
|---------|------|--------|------|
| **Backend** | 8000 | ✅ | `curl localhost:8000/api/v1/system/health` |
| **Frontend** | 3001 | ✅ | `curl localhost:3001/` |
| **WebSockets** | 8000 | ✅ | Connexion automatique |

---

**🎉 Votre plateforme est maintenant entièrement fonctionnelle !**
