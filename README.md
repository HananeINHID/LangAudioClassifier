# DialectID - Application de Classification Audio

Application SaaS d'intelligence artificielle pour la détection et classification des dialectes audio (Darija, Amazigh, Arabe Standard, Anglais, Français).

## 🎯 Architecture du Projet

```
LangAudioClassifier/
├── backend/          # Django REST API + Pipeline ML
├── frontend/         # React + Vite + Capacitor
└── models/           # Modèles .h5 (M1 à M5)
```

## 📁 Structure Complète

### Backend (Django)

| Fichier | Description |
|---------|-------------|
| `api/views.py` | Vue principale de l'API |
| `api/services/ml_pipeline.py` | Orchestrateur ML avec les 5 modèles |
| `api/urls.py` | Routes API |
| `orchestrator.py` | Script de test standalone |

### Frontend (React)

| Fichier | Description |
|---------|-------------|
| `src/App.jsx` | Router et layout principal |
| `src/pages/Home.jsx` | Page d'accueil avec upload/record |
| `src/pages/Analyzing.jsx` | Page de chargement avec animations |
| `src/pages/Result.jsx` | Page de résultats avec PipelineStepper |
| `src/components/AudioUploader.jsx` | Zone de drag & drop |
| `src/components/AudioRecorder.jsx` | Enregistreur audio |
| `src/components/PipelineStepper.jsx` | Visualisation du pipeline |
| `src/components/Loader.jsx` | Animation de chargement |
| `src/components/ResultCard.jsx` | Carte de résultat |
| `src/components/History.jsx` | Historique des analyses |
| `src/components/ThemeToggle.jsx` | Toggle dark/light mode |
| `src/services/api.js` | Service API avec Axios |
| `src/hooks/useTheme.js` | Hook pour le thème |
| `src/hooks/useLocalStorage.js` | Hook pour le localStorage |

## 🚀 Démarrage Rapide

### 1. Backend Django

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install django djangorestframework django-cors-headers tensorflow librosa numpy

# Lancer le serveur
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

### 2. Frontend React

```bash
cd frontend

# Installer les dépendances
npm install

# Mode développement
npm run dev

# Build pour production
npm run build
```

Le frontend sera accessible sur `http://localhost:5173`

## 📱 Build APK Android (Capacitor)

### Prérequis
- Android Studio installé
- SDK Android configuré
- JAVA_HOME défini

### Commandes de build

```bash
cd frontend

# 1. Première installation (une seule fois)
npm install
npx cap init DialectID com.dialectid.app --web-dir dist
npx cap add android

# 2. Build régulier
npm run cap:build:android

# Ou manuellement:
npm run build
npx cap sync android
npx cap open android
```

### Dans Android Studio

1. Ouvrir le projet dans `frontend/android/`
2. Attendre la synchronisation Gradle
3. Menu **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. L'APK sera généré dans `android/app/build/outputs/apk/debug/`

## 🔧 Configuration

### Variables d'environnement Frontend

Créer un fichier `.env` dans `frontend/` :

```env
VITE_API_URL=http://localhost:8000/api
```

Pour mobile (production) :
```env
VITE_API_URL=https://votre-api.com/api
```

### Configuration Capacitor

Fichier `capacitor.config.json` :

```json
{
  "appId": "com.dialectid.app",
  "appName": "DialectID",
  "webDir": "dist",
  "server": {
    "cleartext": true
  }
}
```

## 📊 Pipeline ML

```
M1 (Routeur) ─┬─> Local ──> M2 ─┬─> Darija ──> M5 ──> [Chamal/Dakhil/Sahra]
              │                  │
              │                  └─> Amazigh ──> M4 ──> [Souss/Atlas/Rif]
              │
              └─> Standard ──> M3 ──> [Arabe/Anglais/Français]
              
              └─> Bruit ──> STOP
```

### Format de réponse JSON

```json
{
  "chemin": [
    {"etape": 1, "modele": "M1 (Routeur)", "prediction": "Local", "confiance": 0.89, "icone": "route"},
    {"etape": 2, "modele": "M2 (Famille Locale)", "prediction": "Darija", "confiance": 0.95, "icone": "home"},
    {"etape": 3, "modele": "M5 (Dialectes Darija)", "prediction": "Chamal", "confiance": 0.82, "icone": "map-pin"}
  ],
  "decision_finale": "Darija - Chamal",
  "audio_valide": true,
  "famille": "Darija",
  "sous_dialecte": "Chamal",
  "code": "DAR_0"
}
```

## 🎨 Design System

### Couleurs
- **Primary**: Indigo (#6366f1)
- **Accent**: Violet (#d946ef)
- **Success**: Emeraude (#10b981)
- **Warning**: Ambre (#f59e0b)
- **Danger**: Rose (#f43f5e)

### Thèmes
- Light mode: fond off-white, cartes blanches glassmorphism
- Dark mode: fond slate-900, glassmorphism renforcé

### Composants UI
- Glass cards avec `backdrop-blur-md`
- Boutons avec gradients et glow
- Animations Framer Motion
- Icônes Lucide React

## 📱 Fonctionnalités Mobile

- ✅ Enregistrement audio natif
- ✅ Upload de fichiers audio
- ✅ Visualisation du pipeline en temps réel
- ✅ Historique des analyses (localStorage)
- ✅ Export JSON des résultats
- ✅ Partage des résultats
- ✅ Mode offline (données en cache)
- ✅ Dark/Light mode

## 🧪 Test avec Mock

Le système fonctionne même sans les modèles M2-M5 grâce aux mocks qui génèrent des prédictions réalistes pour le développement et les tests UI.

## 🔒 Permissions Android

Le fichier `AndroidManifest.xml` inclut :
- `RECORD_AUDIO` - Pour l'enregistrement
- `READ_EXTERNAL_STORAGE` - Pour l'upload
- `INTERNET` - Pour l'API

## 📝 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Dev server Vite |
| `npm run build` | Build production |
| `npm run cap:sync` | Sync Capacitor |
| `npm run cap:open:android` | Ouvrir Android Studio |
| `npm run cap:build:android` | Build APK debug |
| `npm run mobile:dev` | Dev mode pour mobile |

## 🐛 Dépannage

### Problème CORS
Ajouter dans `settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8100",
]
```

### Erreur de build Capacitor
```bash
rm -rf android
npx cap add android
npx cap sync
```

### Microphone non détecté
Vérifier les permissions dans Android > Paramètres > Applications > DialectID > Permissions

## 📚 Documentation API

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/` | Health check |
| POST | `/api/predict/` | Analyser un fichier audio |

### Exemple requête

```bash
curl -X POST http://localhost:8000/api/predict/ \
  -F "audio=@fichier.wav"
```

## 🎓 Crédits

- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- Backend: Django 4, Django REST Framework, TensorFlow
- Mobile: Capacitor 6, Android SDK

---

**DialectID** - Intelligence Artificielle pour la préservation des dialectes