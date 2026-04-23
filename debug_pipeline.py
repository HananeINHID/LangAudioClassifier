import os
import sys

# Ajouter le backend au path pour pouvoir importer ml_pipeline
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import numpy as np
import librosa
import tensorflow as tf
from backend.api.services.ml_pipeline import preprocess_audio, ModelOrchestrator

def extract_features_correct(audio_path):
    y, sr = librosa.load(audio_path, sr=16000, mono=True)
    y_trimmed, _ = librosa.effects.trim(y, top_db=20)
    
    target_length = 16000 * 5
    if len(y_trimmed) > target_length:
        y_final = y_trimmed[:target_length]
    else:
        padding = target_length - len(y_trimmed)
        y_final = np.pad(y_trimmed, (0, padding), mode='constant')
        
    mel_spectrogram = librosa.feature.melspectrogram(y=y_final, sr=16000, n_mels=128, fmax=8000)
    mel_spectrogram_db = librosa.power_to_db(mel_spectrogram, ref=np.max)
    
    entree_modele = np.expand_dims(mel_spectrogram_db, axis=0) 
    entree_modele = np.expand_dims(entree_modele, axis=-1)
    return entree_modele

print("=== DEBBUGING PREPROCESSING ===")
# Create a dummy audio of 3 seconds noise
import soundfile as sf
audio = np.random.randn(16000 * 3)
sf.write("dummy.wav", audio, 16000)

tensor_pipeline = preprocess_audio("dummy.wav")
tensor_correct = extract_features_correct("dummy.wav")

print(f"Shape pipeline: {tensor_pipeline.shape}")
print(f"Shape correct: {tensor_correct.shape}")

diff = np.abs(tensor_pipeline - tensor_correct).mean()
print(f"Difference absolue moyenne: {diff}")

print("\n=== DEBUGGING ROUTING & MODELS ===")
orchestrator = ModelOrchestrator()
orchestrator.MODEL_PATHS = {
    "M1_Routeur": "models/modele1.h5",
    "M2_Local": "models/model2.h5",
    "M3_Standard": "models/model3.h5",
    "M4_Amazigh": "models/model4.h5",
    "M5_Darija": "models/model5.h5"
}

# Test M1
print("Loading REAL models explicitly for debugging...")
for key in ["M1_Routeur", "M2_Local", "M3_Standard"]:
    path = os.path.join(os.path.dirname(__file__), orchestrator.MODEL_PATHS[key])
    if os.path.exists(path):
        orchestrator._models[key] = tf.keras.models.load_model(path)
        print(f"{key} loaded.")
    else:
        print(f"Path not found: {path}")

print("\nTesting M1 routing logic:")
print("Sending `tensor_correct` to M1:")
pred, conf = orchestrator.predict("M1_Routeur", tensor_correct)
print(f"M1 Output -> Pred: {pred}, Conf: {conf}")

print("Sending `tensor_correct` to M2:")
pred, conf = orchestrator.predict("M2_Local", tensor_correct)
print(f"M2 Output -> Pred: {pred}, Conf: {conf}")

print("Sending `tensor_correct` to M3:")
pred, conf = orchestrator.predict("M3_Standard", tensor_correct)
print(f"M3 Output -> Pred: {pred}, Conf: {conf}")
