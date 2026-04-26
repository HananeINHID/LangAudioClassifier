# Colle ça dans test_audio_debug.py et relance
import librosa
import numpy as np
import matplotlib.pyplot as plt

def visualiser_ce_que_le_modele_voit(wav_path):
    y, sr = librosa.load(wav_path, sr=16000, mono=True)

    print(f"=== AVANT peak normalization ===")
    print(f"Amplitude max : {np.abs(y).max():.4f}")
    print(f"Silence 72%   : {(np.abs(y) < 0.01).mean()*100:.1f}%")

    # Ce que ton backend fait actuellement
    peak = np.abs(y).max()
    y_norm = y / peak * 0.9          # peak normalization

    print(f"\n=== APRÈS peak normalization ===")
    print(f"Amplitude max : {np.abs(y_norm).max():.4f}")
    # Le bruit de fond qui était à 0.002 est maintenant à 0.002/0.187*0.9 = 0.01
    # → amplification du bruit de fond de 4.8x
    bruit_amplifie = 0.002 / peak * 0.9
    print(f"Bruit de fond amplifié à : {bruit_amplifie:.4f} (était 0.002)")

    # Mel spectrogramme — ce que le modèle voit réellement
    mel    = librosa.feature.melspectrogram(y=y_norm, sr=16000,
                                             n_mels=128, fmax=8000,
                                             n_fft=2048, hop_length=512)
    mel_db = librosa.power_to_db(mel, ref=np.max)
    s_min, s_max = mel_db.min(), mel_db.max()
    tenseur = (mel_db - s_min) / (s_max - s_min + 1e-6)

    print(f"\n=== TENSEUR FINAL (128x157) ===")
    print(f"Min   : {tenseur.min():.4f}")
    print(f"Max   : {tenseur.max():.4f}")
    print(f"Mean  : {tenseur.mean():.4f}  (dataset train ~ 0.4-0.6)")
    print(f"Std   : {tenseur.std():.4f}")

    # Visualisation
    fig, axes = plt.subplots(1, 3, figsize=(15, 4))

    # Waveform
    t = np.linspace(0, len(y)/sr, len(y))
    axes[0].plot(t, y_norm, linewidth=0.3, color='#2e86c1')
    axes[0].axhline(0.01,  color='red', linestyle='--',
                     linewidth=0.8, label='seuil bruit')
    axes[0].axhline(-0.01, color='red', linestyle='--', linewidth=0.8)
    axes[0].fill_between(t, -0.01, 0.01, alpha=0.2, color='red',
                          label=f'silence ({72}%)')
    axes[0].set_title('Waveform après peak norm')
    axes[0].set_xlabel('Temps (s)')
    axes[0].legend(fontsize=8)
    axes[0].grid(True, alpha=0.3)

    # Spectrogramme brut dB
    axes[1].imshow(mel_db, aspect='auto', origin='lower',
                   cmap='magma', vmin=-80, vmax=0)
    axes[1].set_title('Mel dB brut [-80, 0]')
    axes[1].set_xlabel('Frames')
    axes[1].set_ylabel('Bins mel')
    plt.colorbar(axes[1].images[0], ax=axes[1], format='%+.0f dB')

    # Tenseur normalisé — CE QUE LE MODÈLE VOIT
    im = axes[2].imshow(tenseur, aspect='auto', origin='lower',
                        cmap='viridis', vmin=0, vmax=1)
    axes[2].set_title('Tenseur normalisé [0,1]\n← CE QUE LE MODÈLE VOIT')
    axes[2].set_xlabel('Frames')
    axes[2].set_ylabel('Bins mel')
    plt.colorbar(im, ax=axes[2])

    plt.suptitle(f'Diagnostic : {wav_path.split("/")[-1]}', fontsize=11)
    plt.tight_layout()
    plt.savefig('debug_tenseur.png', dpi=150, bbox_inches='tight')
    plt.show()
    print("\nImage sauvegardée : debug_tenseur.png")

    return tenseur

tenseur = visualiser_ce_que_le_modele_voit('../audio_003.wav')