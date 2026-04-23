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

# ── Paramètres MEL identiques à l'entraînement ─────────────────
MEL_SR          = 16000
MEL_N_MELS      = 128
MEL_FMAX        = 8000
MEL_N_FFT       = 2048
MEL_HOP_LENGTH  = 512
TARGET_SAMPLES  = MEL_SR * 5        # 80 000 — 5 secondes exactes
TARGET_FRAMES   = 157               # frames temporelles du tenseur

# Classes du modèle (ordre des sorties softmax)
ID2LABEL = {0: 'local', 1: 'standard', 2: 'bruit'}

# Seuils de confiance (validés)
SEUIL_OK     = 0.65
SEUIL_REJET  = 0.40


def preprocess_wav(wav_path):
    """
    Preprocessing exact du Modèle 1 :
      1. load 16kHz mono
      2. Pad/Truncate 5s  — PAS de trim
      3. Peak normalization
      4. melspectrogram (n_mels=128, n_fft=2048, hop=512, fmax=8000)
      5. power_to_db
      6. MinMax -> [0, 1]
      7. Reshape -> (1, 128, 157, 1) float32

    Returns:
        numpy array (1, 128, 157, 1)
    """
    y, sr = librosa.load(wav_path, sr=MEL_SR, mono=True)

    # Pad/Truncate — PAS de trim
    if len(y) >= TARGET_SAMPLES:
        y = y[:TARGET_SAMPLES]
    else:
        y = np.pad(y, (0, TARGET_SAMPLES - len(y)), mode='constant')

    # Peak normalization
    peak = np.max(np.abs(y))
    if peak > 1e-8:
        y = y / peak

    # Mel Spectrogram
    mel = librosa.feature.melspectrogram(
        y=y, sr=MEL_SR,
        n_mels=MEL_N_MELS, n_fft=MEL_N_FFT,
        hop_length=MEL_HOP_LENGTH, fmax=MEL_FMAX
    )
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # Ajustement longueur temporelle -> 157 frames
    if mel_db.shape[1] > TARGET_FRAMES:
        mel_db = mel_db[:, :TARGET_FRAMES]
    elif mel_db.shape[1] < TARGET_FRAMES:
        pad = TARGET_FRAMES - mel_db.shape[1]
        mel_db = np.pad(mel_db, ((0, 0), (0, pad)), mode='constant', constant_values=mel_db.min())

    # MinMax -> [0, 1]
    mn, mx = mel_db.min(), mel_db.max()
    mel_db = (mel_db - mn) / (mx - mn) if mx - mn > 1e-8 else np.zeros_like(mel_db)

    tenseur = mel_db.reshape(1, MEL_N_MELS, TARGET_FRAMES, 1).astype(np.float32)
    logger.debug(f"Tenseur: shape={tenseur.shape}, min={tenseur.min():.4f}, max={tenseur.max():.4f}")
    return tenseur


def routeur_production(wav_path, modele, seuil_confiance=SEUIL_OK):
    """
    Classifie un fichier WAV et retourne la décision de routage.

    Returns dict compatible avec le frontend :
        classe_predite, route, confiance, probabilites, statut
    """
    tenseur = preprocess_wav(wav_path)

    # Prediction
    if modele is None:
        logger.warning("Modele routeur absent - mode MOCK")
        probs = np.array([0.60, 0.30, 0.10], dtype=np.float32)
    else:
        probs = modele(tenseur, training=False).numpy()[0]

    classe_idx = int(np.argmax(probs))
    confiance  = float(probs[classe_idx])
    classe     = ID2LABEL[classe_idx]

    probabilites = {
        ID2LABEL[i]: round(float(probs[i]), 4) for i in range(len(ID2LABEL))
    }

    # Logique de routage avec seuils valides
    route_map = {'local': 'modele2', 'standard': 'modele3', 'bruit': 'rejeter'}
    if confiance < SEUIL_REJET:
        statut = 'rejete'
        route  = 'rejeter'
    elif confiance < seuil_confiance: 
        statut = 'uncertain'
        route  = route_map.get(classe, 'rejeter')
    else:
        statut = 'ok'
        route  = route_map.get(classe, 'rejeter')

    logger.info(f"[ROUTEUR] {classe} (conf={confiance:.3f}) -> route={route}, statut={statut}")

    return {
        # Format attendu par le frontend (AudioAnalyzer.jsx)
        'classe_predite': classe,
        'confiance':      round(confiance, 4),
        'route':          route,
        'probabilites':   probabilites,
        'statut':         statut,
        # Champs legacy conserves pour retrocompat
        'prediction':     classe,
        'probs':          [round(float(p), 4) for p in probs],
        'seuil_atteint':  confiance >= seuil_confiance,
    }


def process_audio_file(audio_file, modele, seuil_confiance=SEUIL_OK):
    """
    Recoit un InMemoryUploadedFile Django, sauvegarde dans un temp,
    appelle routeur_production et nettoie.
    """
    temp_path = None
    try:
        suffix = os.path.splitext(audio_file.name)[1] or '.wav'
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in audio_file.chunks():
                tmp.write(chunk)
            temp_path = tmp.name

        logger.info(f"Fichier temporaire: {temp_path}")
        result_m1 = routeur_production(temp_path, modele, seuil_confiance)
        
        # --- MISSION 2 : Construction du pipeline ---
        from api.apps import ApiConfig
        
        pipeline_result = {
            "etape1": "modele1_routeur",
            "etape1_classe": result_m1["classe_predite"],
            "etape1_confiance": result_m1["confiance"],
            "etape2": None,
            "etape2_disponible": False,
            "dialecte": None,
            "dialecte_confiance": None,
            "dialecte_probabilites": None,
            "message": None
        }

        if result_m1["route"] == "modele2":
            pipeline_result["etape2"] = "modele2_local"
            modele2 = ApiConfig.get_model("local")
            
            if modele2 is not None:
                pipeline_result["etape2_disponible"] = True
                pipeline_result["dialecte"] = "Darija (mock)"  # En attendant la fonction predict_with_model
                pipeline_result["dialecte_confiance"] = 0.95
            else:
                pipeline_result["etape2_disponible"] = False
                pipeline_result["message"] = "Modèle 2 en cours d'entraînement — disponible prochainement"

        elif result_m1["route"] in ("modele3", "whisper"):
            pipeline_result["etape2"] = "whisper"
            modele3 = ApiConfig.get_model("standard")
            
            if modele3 is not None:
                pipeline_result["etape2_disponible"] = True
                pipeline_result["transcription"] = "Transcription indisponible (mock)"
            else:
                pipeline_result["etape2_disponible"] = False
                pipeline_result["message"] = "Whisper non configuré — disponible prochainement"

        result_m1["pipeline"] = pipeline_result
        return result_m1

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f"Fichier temporaire supprimé: {temp_path}")
