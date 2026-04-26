import numpy as np
import librosa

MEL_PARAMS = dict(sr=16000, n_mels=128, fmax=8000, n_fft=2048, hop_length=512)
TARGET_LEN = 16000 * 5  # 5 secondes exactes

import os
stats_path = os.path.join(os.path.dirname(__file__), 'norm_stats.npy')
stats       = np.load(stats_path)
GLOBAL_MEAN = float(stats[0])
GLOBAL_STD  = float(stats[1])
print(f"Stats chargées : mean={GLOBAL_MEAN:.4f}, std={GLOBAL_STD:.4f}")

def preprocess_audio(wav_path):
    """
    Pipeline preprocessing aligné sur le dataset d'entraînement.
    Ordre : load → split voix → pad (voix au début) → peak norm → mel → dB → minmax
    """
   # 1. Charger l'audio
    y, sr = librosa.load(wav_path, sr=16000, mono=True)

    # 2. Extraire la voix et supprimer les silences
    intervals = librosa.effects.split(y, top_db=35)
    if len(intervals) > 0:
        segments = [y[start:end] for start, end in intervals]
        y = np.concatenate(segments)

    # 3. Forcer à 5 secondes exactes
    if len(y) >= TARGET_LEN:
        y = y[:TARGET_LEN]
    else:
        y = np.pad(y, (0, TARGET_LEN - len(y)), mode='constant')

    # 4. Peak normalization
    peak = np.abs(y).max()
    if peak > 1e-6:
        y = y / peak * 0.9

    # 5. Mel spectrogramme
    mel    = librosa.feature.melspectrogram(y=y, **MEL_PARAMS)
    mel_db = librosa.power_to_db(mel, ref=np.max)

    # 6. Normalisation Z-Score — identique au générateur d'entraînement
    tenseur = (mel_db - GLOBAL_MEAN) / (GLOBAL_STD + 1e-6)

    # 7. Vérification
    assert tenseur.shape == (128, 157), \
        f"Shape incorrecte : {tenseur.shape}"

    return tenseur.astype(np.float32)[np.newaxis, :, :, np.newaxis]


# Test
if __name__ == '__main__':
    import sys
    path = sys.argv[1]
    t = preprocess_audio(path)
    print(f"Shape : {t.shape}")
    print(f"Mean  : {t.mean():.4f}")