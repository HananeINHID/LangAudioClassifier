import os
import sys
import numpy as np
import tensorflow as tf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Permet l'import de preprocess_audio depuis le backend Django
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.preprocessing import preprocess_audio

MODEL_FILES = {
    'routeur' : 'models/modele1_routeur_meilleur.h5',
    'local'   : 'models/modele2_local.h5',
    'standard': 'models/modele3_standard.h5',
    'amazigh' : 'models/modele4_amazigh.h5',
    'darija'  : 'models/modele5_darija.h5',
}

LABEL_MAPS = {
    'routeur' : {0: 'local',      1: 'standard',  2: 'bruit'},
    'local'   : {0: 'amazigh',    1: 'darija'},
    'darija'  : {0: 'chamaliya',  1: 'dakhil',    2: 'hassania'},
    'amazigh' : {0: 'souss',      1: 'atlas',      2: 'ref'},
    'standard': {0: 'anglais',    1: 'arabe',      2: 'francais'},
}

_MODELS_CACHE = {}

def get_model(model_key):
    if model_key not in MODEL_FILES:
        return None
    # Les modèles sont dans le dossier backend/models/
    model_path = os.path.join(os.path.dirname(__file__), '..', 'backend', MODEL_FILES[model_key])
    if not os.path.exists(model_path):
        return None
    if model_key not in _MODELS_CACHE:
        _MODELS_CACHE[model_key] = tf.keras.models.load_model(model_path, compile=False)
    return _MODELS_CACHE[model_key]

def run_model(model_key, wav_path, label_map):
    model = get_model(model_key)
    if not model:
        return None
    
    tensor = preprocess_audio(wav_path)
    preds = model.predict(tensor, verbose=0)[0]
    
    if len(preds) == 1:
        # Binaire (Sigmoid)
        p1 = float(preds[0])
        p0 = 1.0 - p1
        idx = 1 if p1 >= 0.5 else 0
        confiance = p1 if idx == 1 else p0
        probabilites = {
            label_map.get(0, "classe_0"): p0,
            label_map.get(1, "classe_1"): p1
        }
    else:
        # Multiclasse (Softmax)
        idx = int(np.argmax(preds))
        confiance = float(preds[idx])
        probabilites = {label_map.get(i, f"classe_{i}"): float(p) for i, p in enumerate(preds)}
    
    return {
        "classe": label_map.get(idx, "inconnu"),
        "confiance": confiance,
        "probabilites": probabilites
    }

from routes import predict

app = FastAPI(title="LangAudioClassifier API")

# --- CAUSE 1 : Configuration CORS ---
# Le middleware CORS doit être ajouté AVANT les routers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FastAPI LangAudioClassifier"}
