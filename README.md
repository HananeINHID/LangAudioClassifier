# DialectID - Application de Classification Audio IA

DialectID est une application web intelligente (SaaS) basée sur une architecture de **Machine Learning hiérarchique**. Elle permet la détection et la classification avec une grande précision des dialectes audio (Darija, Amazigh, Arabe Standard, Anglais, Français).

## 🗂 Dataset

Le dataset utilisé pour entraîner nos modèles CNN est disponible sur Google Drive :
👉 **[Lien vers le Dataset DialectID](https://drive.google.com/drive/folders/16h5BjxCcy9ErUR5Sk6Ike_mCUlhihlT_?usp=drive_link)**

## 🎯 Architecture du Projet

Le projet est divisé en deux parties distinctes :

```
LangAudioClassifier/
├── backend/          # Django REST Framework + Pipeline ML TensorFlow
├── frontend/         # React + Vite + Tailwind CSS (Interface claire et moderne)
└── models/           # Modèles pré-entraînés .h5 (M1 à M5)
```

## 📁 Structure Complète Actuelle

### Backend (Django)

L'API orchestre un pipeline de 5 modèles CNN en cascade pour filtrer, puis classifier avec précision le flux audio.

| Fichier | Description |
|---------|-------------|
| `api/views.py` | Points d'entrée de l'API REST (ex: `/api/predict/`) |
| `api/services/ml_pipeline.py` | Cœur de l'orchestrateur ML gérant les 5 modèles |
| `api/urls.py` | Routage des appels API |
| `preprocessing.py` | Extraction des caractéristiques audio (MFCC, Mel-Spectrogram) |

### Frontend (React)

L'interface a été entièrement modernisée pour offrir un rendu SaaS professionnel, clair et réactif (Light Theme).

| Fichier | Description |
|---------|-------------|
| `src/App.jsx` | Router principal (`/`, `/dashboard`, `/history`) |
| `src/pages/HomePage.jsx` | Landing page présentant les capacités du pipeline ML |
| `src/pages/DashboardPage.jsx` | Wrapper de la page d'analyse |
| `src/pages/HistoryPage.jsx` | Historique local des analyses de l'utilisateur |
| `src/components/AudioAnalyzer.jsx`| Interface principale (Upload/Enregistrement & Affichage des Niveaux de Pipeline) |
| `src/components/layout/Navbar.jsx`| Navigation fluide |
| `src/services/api.js` | Service Axios gérant les requêtes vers Django |

## 🧠 Architecture du Pipeline ML

Le système utilise un routage conditionnel pour optimiser la performance et la précision.

```text
M1 (Routeur) ─┬─> Local ──> M2 ─┬─> Darija ──> M5 ──> [Chamal / Dakhil / Sahra]
              │                  │
              │                  └─> Amazigh ──> M4 ──> [Souss / Atlas / Rif]
              │
              └─> Standard ──> M3 ──> [Arabe / Anglais / Français]
              
              └─> Bruit ──> REJETÉ (Analyse stoppée)
```

### Exemple de Réponse JSON (API)

```json
{
  "pipeline": {
    "niveau1": { "modele": "Routeur", "classe": "Local", "confiance": 0.97, "disponible": true },
    "niveau2": { "modele": "Famille Locale", "classe": "Amazigh", "confiance": 0.85, "disponible": true },
    "niveau3": { "modele": "Dialectes Amazigh", "classe": "Rif", "confiance": 0.81, "disponible": true }
  },
  "decision_finale": "Amazigh - Rif",
  "confiance": 0.81,
  "audio_valide": true
}
```

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
pip install -r requirements.txt

# Lancer le serveur (par défaut sur le port 8000)
python manage.py runserver
```

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
Le frontend sera accessible sur `http://localhost:5173`.

## 🎨 Design System (Interface SaaS)

L'application utilise désormais un **Thème Clair Professionnel** :
- **Fond principal** : Blanc cassé (`#F8FAFC`).
- **Brand / Accent** : Indigo (`#4F46E5`) & Violet pour les gradients subtils.
- **Typographie** : Inter (lisible, moderne).
- **Composants** : Cartes avec bordures légères (`#E2E8F0`), ombres douces (`shadow-sm`).

## 📱 Fonctionnalités Actuelles

- ✅ Enregistrement audio natif via microphone
- ✅ Upload de fichiers audio (WAV, MP3, OGG, M4A)
- ✅ Visualisation dynamique du pipeline de décision (M1 ➔ M2 ➔ M3/4/5)
- ✅ Historique des analyses stocké localement
- ✅ Responsive Design fluide (Mobile / Desktop)

## 🐛 Dépannage

### Problème CORS (Communication Front/Back)
Assurez-vous que l'URL du frontend est autorisée dans `settings.py` :
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

### Microphone non détecté
Le navigateur bloquera le microphone si l'application n'est pas servie en `localhost` ou `https`. Vérifiez l'URL ou acceptez l'autorisation contextuelle.

---
**DialectID** - Intelligence Artificielle pour la classification et la préservation des dialectes.