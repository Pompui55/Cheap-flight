# 🚀 Commandes Rapides - Publication CHEAP FLIGHT

## ✅ Ce qui est déjà fait sur Emergent :
- ✅ app.json configuré avec le package `com.cheapflight.app`
- ✅ eas.json créé avec la configuration de build
- ✅ Permissions Android configurées
- ✅ Application fonctionnelle et testée

---

## 📥 ÉTAPE 1 : Télécharger le Code

1. Depuis Emergent, téléchargez tout le dossier `/app/frontend`
2. Sauvegardez-le sur votre machine locale

---

## 💻 ÉTAPE 2 : Installer les Outils (Sur Votre Machine)

```bash
# Installer Node.js si pas déjà fait
# Télécharger depuis : https://nodejs.org/

# Installer EAS CLI globalement
npm install -g eas-cli

# Vérifier l'installation
eas --version
```

---

## 🔐 ÉTAPE 3 : Créer un Compte Expo

1. Allez sur : https://expo.dev/signup
2. Créez un compte gratuit
3. Confirmez votre email

---

## 📱 ÉTAPE 4 : Générer le Build

```bash
# Ouvrir un terminal dans le dossier /frontend téléchargé
cd chemin/vers/frontend

# Se connecter à Expo
eas login
# Entrez votre email et mot de passe Expo

# Configurer le projet (première fois uniquement)
eas build:configure
# Répondez "Y" pour créer un projet

# GÉNÉRER LE BUILD PRODUCTION (.aab pour Play Store)
eas build --platform android --profile production

# ⏱️ Durée : 15-30 minutes
# ✅ Vous recevrez un email avec le lien de téléchargement
```

---

## 📥 ÉTAPE 5 : Télécharger le Fichier .aab

Une fois le build terminé :

**Option 1 : Email**
- Vous recevrez un email d'Expo
- Cliquez sur "View build"
- Téléchargez le fichier `.aab`

**Option 2 : Dashboard Expo**
- Allez sur : https://expo.dev/
- Connectez-vous
- Allez dans "Projects" → "cheap-flight"
- Onglet "Builds"
- Téléchargez le dernier build `.aab`

---

## 📤 ÉTAPE 6 : Soumettre sur Play Console

1. **Créer l'application**
   - Allez sur : https://play.google.com/console
   - Cliquez "Créer une application"
   - Nom : **Cheap Flight**
   - Langue : **Français**

2. **Uploader le .aab**
   - Menu : Production → Releases
   - "Créer une nouvelle version"
   - Upload le fichier `.aab`
   - Notes de version : "Version 1.0.0 - Lancement initial"

3. **Compléter la fiche**
   - Icône : 512x512 px (violet cosmique avec avion)
   - Screenshots : 4 captures minimum
   - Descriptions (voir GUIDE_PLAY_STORE.md)
   - Feature graphic : 1024x500 px

4. **Soumettre**
   - Vérifier la version
   - Lancer le déploiement

---

## 🔄 Pour les Mises à Jour Futures

Quand vous voulez publier une nouvelle version :

```bash
# 1. Modifier app.json - incrémenter les versions
# version: "1.0.0" → "1.0.1"
# android.versionCode: 1 → 2

# 2. Générer un nouveau build
eas build --platform android --profile production

# 3. Télécharger le nouveau .aab

# 4. Sur Play Console → Créer une nouvelle version
# Upload le nouveau .aab
```

---

## 🆘 En Cas de Problème

### "Build failed" sur Expo
```bash
# Vérifier les logs
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]
```

### "Package name already exists" sur Play Console
- Le package `com.cheapflight.app` doit être unique
- Si déjà pris, modifiez dans app.json :
  ```json
  "android": {
    "package": "com.votreprenom.cheapflight"
  }
  ```

### "Application not responding" lors du test
- Assurez-vous que le backend est accessible
- URL configurée : `https://cheap-flight.preview.emergentagent.com`

---

## 📞 Support

- **Expo Documentation** : https://docs.expo.dev/
- **Play Console Support** : https://support.google.com/googleplay/android-developer
- **Expo Forums** : https://forums.expo.dev/

---

## ✅ Checklist Rapide

- [ ] Code téléchargé depuis Emergent
- [ ] EAS CLI installé (`npm install -g eas-cli`)
- [ ] Compte Expo créé
- [ ] Compte Play Console créé ($25 payé)
- [ ] Build lancé (`eas build --platform android`)
- [ ] Fichier .aab téléchargé
- [ ] Assets préparés (icône, screenshots, descriptions)
- [ ] Application soumise sur Play Console

---

**Temps total estimé : 2-3 heures de travail + 1-2 semaines de review Google**

Bon courage ! 🚀✈️
