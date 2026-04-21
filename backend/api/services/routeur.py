"""
Service de routage pour l'analyse audio.
Implémente la logique d'inférence du modèle CNN Routeur.
"""
import numpy as np
import librosa
import tempfile
import os
import logging

logger = logging.getLogger(__name__)

# Mapping des indices vers les labels
ID2LABEL = {0: 'local', 1: 'standard', 2: 'other'}


def routeur_production(wav_path, modele, seuil_confiance=0.65):
    """
    Fonction de routage pour classifier un audio et décider du pipeline à suivre.
    
    Args:
        wav_path: Chemin vers le fichier audio WAV
        modele: Modèle TensorFlow/Keras chargé
        seuil_confiance: Seuil minimum de confiance (défaut: 0.65)
    
    Returns:
        dict: Résultat avec prediction, confiance, route et probabilités
    """
    try:
        # 1. Chargement audio (16kHz, mono)
        y, sr = librosa.load(wav_path, sr=16000, mono=True)
        
        # 2. Pad/Truncate à 5 secondes (16000 * 5 = 80000 échantillons)
        target = 16000 * 5
        if len(y) >= target:
            y = y[:target]
        else:
            y = np.pad(y, (0, target - len(y)), mode='constant')
        
        # 3. Extraction du Mel Spectrogram (128 mels, fmax=8000)
        mel = librosa.feature.melspectrogram(y=y, sr=16000, n_mels=128, fmax=8000)
        mel_db = librosa.power_to_db(mel, ref=np.max)
        
        # 4. Normalisation Min-Max
        s_min, s_max = mel_db.min(), mel_db.max()
        if s_max - s_min > 1e-6:
            tenseur = (mel_db - s_min) / (s_max - s_min)
        else:
            tenseur = np.zeros_like(mel_db)
        
        # 5. Reshape pour le modèle (batch, mels, time, channels)
        entree = tenseur[np.newaxis, :, :, np.newaxis].astype(np.float32)
        
        # 6. Prédiction
        if modele is None:
            # Mode MOCK si pas de modèle chargé
            logger.warning("Mode MOCK: simulation de prédiction")
            probs = np.array([0.6, 0.3, 0.1])  # local, standard, other
        else:
            probs = modele(entree, training=False).numpy()[0]
        
        # 7. Récupération de la classe prédite
        classe_idx = int(np.argmax(probs))
        confiance = float(probs[classe_idx])
        nom_classe = ID2LABEL[classe_idx]
        
        # 8. Logique de routage
        if confiance < seuil_confiance:
            route = 'uncertain'
        elif nom_classe == 'local':
            route = 'modele2'  # Pipeline Darija/Amazigh
        elif nom_classe == 'standard':
            route = 'whisper'  # Pipeline Whisper pour FR/EN/AR
        else:
            route = 'rejeter'  # Bruit/Other
        
        logger.info(f"Prédiction: {nom_classe} (confiance: {confiance:.3f}) -> Route: {route}")
        
        return {
            'prediction': nom_classe,
            'confiance': round(confiance, 3),
            'route': route,
            'probs': [round(p, 3) for p in probs],
            'seuil_atteint': confiance >= seuil_confiance
        }
        
    except Exception as e:
        logger.error(f"Erreur dans routeur_production: {e}")
        raise


def process_audio_file(audio_file, modele, seuil_confiance=0.65):
    """
    Traite un fichier audio uploadé et retourne le résultat du routage.
    
    Args:
        audio_file: Fichier uploadé (InMemoryUploadedFile)
        modele: Modèle TensorFlow chargé
        seuil_confiance: Seuil de confiance
    
    Returns:
        dict: Résultat du routage
    """
    temp_path = None
    
    try:
        # Créer un fichier temporaire pour librosa
        suffix = os.path.splitext(audio_file.name)[1] or '.wav'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            temp_path = tmp.name
        
        logger.info(f"Fichier temporaire créé: {temp_path}")
        
        # Appeler la fonction de routage
        result = routeur_production(temp_path, modele, seuil_confiance)
        
        return result
        
    finally:
        # Nettoyage du fichier temporaire
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"Fichier temporaire supprimé: {temp_path}")
