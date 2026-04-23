from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import tempfile
import os
import subprocess
import traceback

router = APIRouter()

async def convert_to_wav(file: UploadFile) -> str:
    """Convertit l'audio en WAV 16kHz avec ffmpeg."""
    fd_in, temp_input = tempfile.mkstemp(suffix=os.path.splitext(file.filename)[1])
    with os.fdopen(fd_in, 'wb') as f_in:
        shutil.copyfileobj(file.file, f_in)
        
    fd_out, temp_wav = tempfile.mkstemp(suffix=".wav")
    os.close(fd_out)
    
    try:
        command = [
            "ffmpeg", "-y", "-i", temp_input,
            "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
            temp_wav
        ]
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return temp_wav
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Erreur ffmpeg: {e.stderr.decode()}")
    finally:
        if os.path.exists(temp_input):
            os.remove(temp_input)

import time

def build_niveau(result, nom_modele, absent_msg="Modèle en cours d'entraînement"):
    if result:
        return {
            "disponible"  : True,
            "modele"      : nom_modele,
            "classe"      : result["classe"],
            "confiance"   : result["confiance"],
            "probabilites": result["probabilites"]
        }
    return {
        "disponible": False,
        "modele"    : nom_modele,
        "message"   : absent_msg
    }

@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    start    = time.perf_counter()
    
    valid_extensions = (".webm", ".wav", ".mp3", ".ogg", ".m4a")
    if not file.filename.lower().endswith(valid_extensions):
        raise HTTPException(status_code=400, detail="Format non supporté.")

    wav_path = await convert_to_wav(file)

    try:
        from main import run_model, LABEL_MAPS
        
        # ── NIVEAU 1 : Routeur ────────────────────────────────────────
        r1 = run_model('routeur', wav_path, LABEL_MAPS['routeur'])
        if r1 is None:
            raise HTTPException(status_code=500, detail="Le modèle routeur n'est pas disponible.")

        pipeline = {
            "niveau1": build_niveau(r1, "modele1_routeur"),
            "niveau2": None,
            "niveau3": None,
        }

        # ── NIVEAU 2 + 3 selon classe du Niveau 1 ─────────────────────
        if r1["classe"] == "local":

            r2 = run_model('local', wav_path, LABEL_MAPS['local'])
            pipeline["niveau2"] = build_niveau(
                r2, "modele2_local",
                absent_msg="Modèle Local (Darija/Amazigh) en cours d'entraînement"
            )

            if r2:
                sous_classe = r2["classe"]   # 'darija' ou 'amazigh'
                r3 = run_model(sous_classe, wav_path, LABEL_MAPS[sous_classe])
                pipeline["niveau3"] = build_niveau(
                    r3,
                    f"modele_{sous_classe}",
                    absent_msg=f"Modèle {sous_classe.capitalize()} en cours d'entraînement"
                )

        elif r1["classe"] == "standard":

            r2 = run_model('standard', wav_path, LABEL_MAPS['standard'])
            pipeline["niveau2"] = build_niveau(
                r2, "modele5_standard",
                absent_msg="Modèle Standard (FR/EN/AR) en cours d'entraînement"
            )
            # Pas de niveau 3 pour standard

        elif r1["classe"] == "bruit":
            # Pipeline arrêté — pas de niveau 2 ni 3
            pipeline["niveau2"] = None
            pipeline["niveau3"] = None

        temps_ms = round((time.perf_counter() - start) * 1000, 2)

        return {
            "classe_predite"    : r1["classe"],
            "confiance"         : r1["confiance"],
            "probabilites"      : r1["probabilites"],
            "route"             : r1["classe"],
            "statut"            : "ok" if r1["confiance"] >= 0.65 else "uncertain",
            "temps_inference_ms": temps_ms,
            "pipeline"          : pipeline
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)
