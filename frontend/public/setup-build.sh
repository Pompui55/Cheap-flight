#!/bin/bash

echo "🚀 Installation CHEAP FLIGHT Build Environment"
echo ""

# Nettoyage
cd ~
rm -rf cheap-flight-build
mkdir cheap-flight-build
cd cheap-flight-build

echo "✅ Dossier créé"

# Créer package.json
cat > package.json << 'EOF'
{
  "name": "cheap-flight",
  "version": "1.0.0",
  "main": "node_modules/expo-router/entry"
}
EOF

echo "✅ package.json créé"

# Créer app.json
cat > app.json << 'EOF'
{
  "expo": {
    "name": "Cheap Flight",
    "slug": "cheap-flight",
    "version": "1.0.0",
    "orientation": "portrait",
    "android": {
      "package": "com.cheapflight.app",
      "versionCode": 1,
      "permissions": ["INTERNET"]
    }
  }
}
EOF

echo "✅ app.json créé"

# Créer eas.json
cat > eas.json << 'EOF'
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
EOF

echo "✅ eas.json créé"

echo ""
echo "🎉 TERMINÉ ! Tous les fichiers sont prêts !"
echo ""
echo "📋 Fichiers créés :"
ls -lh
echo ""
echo "🚀 Pour lancer le build, tapez :"
echo "   npx eas-cli build -p android"
echo ""
