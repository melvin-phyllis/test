#!/bin/bash

# Script pour corriger les permissions de la base de données

echo "🔧 Correction des permissions de la base de données..."

# Créer le fichier de base de données s'il n'existe pas
if [ ! -f "prospecting.db" ]; then
    echo "📄 Création d'une nouvelle base de données SQLite..."
    touch prospecting.db
fi

# Corriger les permissions
chmod 664 prospecting.db
chmod 775 .

echo "✅ Permissions corrigées:"
echo "   - Base de données: $(ls -la prospecting.db | awk '{print $1}')"
echo "   - Dossier: $(ls -lad . | awk '{print $1}')"

echo "🎯 La base de données est maintenant accessible en écriture."