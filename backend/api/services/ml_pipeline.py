import os
import numpy as np
import librosa
import random

# For logging or debugging
import logging
logger = logging.getLogger(__name__)

class ModelOrchestrator:
    """
    Singleton Class to manage the loading and inference of Keras models.
    Implements Lazy Loading to preserve RAM.
    """
    _instance = None
    _models = {}
    
    # Model Paths mapping
    MODEL_PATHS = {
        "M1_Routeur": "models/modele1_routeur_meilleur.h5",
        "M2_Local": "models/modele2_local.h5",
        "M3_Standard": "models/modele3_standard.h5",
        "M4_Amazigh": "models/modele4_amazigh.h5",
        "M5_Darija": "models/modele5_darija.h5"
    }

    # Classes mapping
    CLASSES = {
        "M1_Routeur": ["Local", "Standard", "Bruit"],
        "M2_Local": ["Darija", "Amazigh"],
        "M3_Standard": ["Arabe", "Anglais", "Francais"],
        "M4_Amazigh": ["Souss", "Atlas", "Rif"],
        "M5_Darija": ["Dakhil", "Chamal", "Sahra"]
    }

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelOrchestrator, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def load_model(self, model_key):
        """Loads a model into memory if it is not already loaded."""
        if model_key not in self._models:
            path = self.MODEL_PATHS.get(model_key)
            # Find path relative to the django root or absolute path.
            # Assuming models are in the main repo root:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            full_path = os.path.join(base_dir, path)

            if os.path.exists(full_path):
                import tensorflow as tf
                logger.info(f"Loading REAL model {model_key} from {full_path}")
                self._models[model_key] = tf.keras.models.load_model(full_path)
            else:
                logger.info(f"Loading MOCK model for {model_key} (path not found or mocked)")
                self._models[model_key] = "MOCK"

        return self._models[model_key]

    def predict(self, model_key, tensor):
        """
        Runs inference and returns the class name, confidence, all probabilities, and top-3 predictions.
        
        Returns:
            tuple: (class_name, confidence, all_probabilities, top3_predictions)
        """
        model = self.load_model(model_key)
        classes = self.CLASSES[model_key]

        if model == "MOCK":
            # Mock behavior
            idx = random.randint(0, len(classes) - 1)
            confidence = round(random.uniform(0.70, 0.99), 2)
            # Make the pipeline more predictable for testing
            if model_key == "M1_Routeur":
                idx = random.choice([0, 1])
            
            # Generate all probabilities (mock)
            all_probs = {cls: round(random.uniform(0.01, 0.15), 4) for cls in classes}
            all_probs[classes[idx]] = confidence
            
            # Generate top-3
            top3 = [
                {"langue": classes[idx], "score": confidence * 100},
                {"langue": classes[(idx + 1) % len(classes)], "score": round(confidence * 0.6 * 100, 2)},
                {"langue": classes[(idx + 2) % len(classes)], "score": round(confidence * 0.3 * 100, 2)},
            ]
            return classes[idx], confidence, all_probs, top3
            
        else:
            # Real model inference
            predictions = model.predict(tensor, verbose=0)
            probs = predictions[0]
            
            # Get all probabilities as dict
            all_probs = {classes[i]: round(float(probs[i]) * 100, 2) for i in range(len(classes))}
            
            # Get top-3 predictions
            top3_indices = np.argsort(probs)[-3:][::-1]
            top3 = [
                {"langue": classes[i], "score": round(float(probs[i]) * 100, 2)}
                for i in top3_indices
            ]
            
            best_idx = np.argmax(probs)
            confidence = float(probs[best_idx])
            class_name = classes[best_idx]
            
            return class_name, round(confidence * 100, 2), all_probs, top3

    def evaluate_model(self, model_key, test_data_path=None, max_samples=100):
        """
        Évalue la précision du modèle sur un dataset de test.
        
        Args:
            model_key: Clé du modèle à évaluer
            test_data_path: Chemin vers le dataset de test (optionnel)
            max_samples: Nombre maximum d'échantillons à tester par classe
            
        Returns:
            dict: Métriques (accuracy, precision, recall, f1_score) ou None si pas de dataset
        """
        from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
        
        # Chercher un dataset de test automatiquement
        if test_data_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            potential_paths = [
                os.path.join(base_dir, "dataset_extrait", "spectrograms"),
                os.path.join(base_dir, "dataset_extrait"),
                os.path.join(base_dir, "test_data"),
                os.path.join(base_dir, "data", "test"),
            ]
            for path in potential_paths:
                if os.path.exists(path):
                    test_data_path = path
                    break
        
        if not test_data_path or not os.path.exists(test_data_path):
            logger.warning(f"Dataset de test non trouvé pour {model_key}")
            return {
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1_score": None,
                "dataset_trouve": False,
                "note": "Dataset de test non trouvé"
            }
        
        logger.info(f"Évaluation de {model_key} sur {test_data_path}")
        
        try:
            model = self.load_model(model_key)
            classes = self.CLASSES[model_key]
            
            # Si c'est un mock, retourner des métriques simulées
            if model == "MOCK":
                return {
                    "accuracy": round(random.uniform(0.75, 0.95), 4),
                    "precision": round(random.uniform(0.70, 0.93), 4),
                    "recall": round(random.uniform(0.72, 0.94), 4),
                    "f1_score": round(random.uniform(0.71, 0.935), 4),
                    "dataset_trouve": True,
                    "chemin_dataset": test_data_path,
                    "note": "Métriques simulées (modèle MOCK)",
                    "mode": "MOCK"
                }
            
            # Charger les données du dataset
            y_true = []
            y_pred = []
            
            # Mapper les classes du modèle aux dossiers du dataset
            class_to_folder = {
                "M1_Routeur": {"Local": "local", "Standard": "standard", "Bruit": "other"},
                "M2_Local": {"Darija": "darija", "Amazigh": "tamazight"},
                "M3_Standard": {"Arabe": "arabe", "Anglais": "anglais", "Francais": "francais"},
                "M4_Amazigh": {"Souss": "souss", "Atlas": "atlas", "Rif": "rif"},
                "M5_Darija": {"Dakhil": "dakhil", "Chamal": "chamal", "Sahra": "sahra"}
            }
            
            folder_mapping = class_to_folder.get(model_key, {})
            
            # Parcourir les dossiers du dataset
            samples_per_class = {cls: 0 for cls in classes}
            
            for class_name in classes:
                folder_name = folder_mapping.get(class_name, class_name.lower())
                class_path = os.path.join(test_data_path, folder_name)
                
                if not os.path.exists(class_path):
                    # Essayer de trouver le dossier avec des variantes
                    for subdir in os.listdir(test_data_path) if os.path.exists(test_data_path) else []:
                        if folder_name in subdir.lower() or subdir.lower() in folder_name:
                            class_path = os.path.join(test_data_path, subdir)
                            break
                
                if not os.path.exists(class_path):
                    logger.warning(f"Dossier non trouvé pour la classe {class_name}: {class_path}")
                    continue
                
                # Limiter les échantillons pour la performance
                files = [f for f in os.listdir(class_path) if f.endswith('.npy')][:max_samples]
                
                for file in files:
                    try:
                        file_path = os.path.join(class_path, file)
                        # Charger le spectrogramme prétraité
                        data = np.load(file_path)
                        
                        # Adapter la forme selon le modèle
                        if model_key == "M3_Standard":
                            # M3 attend (1, 40, 200, 1)
                            if data.shape != (1, 40, 200, 1):
                                continue
                        else:
                            # Les autres attendent (1, 128, 157, 1)
                            if data.shape != (1, 128, 157, 1):
                                continue
                        
                        # Prédiction
                        pred = model.predict(data, verbose=0)
                        pred_class_idx = np.argmax(pred[0])
                        pred_class = classes[pred_class_idx]
                        
                        y_true.append(class_name)
                        y_pred.append(pred_class)
                        samples_per_class[class_name] += 1
                        
                    except Exception as e:
                        logger.debug(f"Erreur lors du chargement de {file}: {e}")
                        continue
            
            if len(y_true) == 0:
                return {
                    "accuracy": None,
                    "precision": None,
                    "recall": None,
                    "f1_score": None,
                    "dataset_trouve": True,
                    "chemin_dataset": test_data_path,
                    "note": "Aucun échantillon valide trouvé dans le dataset",
                    "samples_per_class": samples_per_class
                }
            
            # Calculer les métriques
            accuracy = accuracy_score(y_true, y_pred)
            precision, recall, f1, _ = precision_recall_fscore_support(
                y_true, y_pred, average='weighted', zero_division=0
            )
            
            # Calculer la matrice de confusion
            cm = confusion_matrix(y_true, y_pred, labels=classes)
            
            # Métriques par classe
            per_class_metrics = {}
            for i, cls in enumerate(classes):
                cls_precision, cls_recall, cls_f1, _ = precision_recall_fscore_support(
                    y_true, y_pred, labels=[cls], average=None, zero_division=0
                )
                per_class_metrics[cls] = {
                    "precision": round(float(cls_precision[0]), 4) if len(cls_precision) > 0 else 0,
                    "recall": round(float(cls_recall[0]), 4) if len(cls_recall) > 0 else 0,
                    "f1": round(float(cls_f1[0]), 4) if len(cls_f1) > 0 else 0,
                    "samples": samples_per_class.get(cls, 0)
                }
            
            return {
                "accuracy": round(float(accuracy), 4),
                "precision": round(float(precision), 4),
                "recall": round(float(recall), 4),
                "f1_score": round(float(f1), 4),
                "dataset_trouve": True,
                "chemin_dataset": test_data_path,
                "total_samples": len(y_true),
                "samples_per_class": samples_per_class,
                "per_class_metrics": per_class_metrics,
                "confusion_matrix": cm.tolist(),
                "note": "Métriques calculées sur le dataset de test"
            }
            
        except Exception as e:
            logger.error(f"Erreur lors de l'évaluation du modèle {model_key}: {e}")
            return {
                "accuracy": None,
                "precision": None,
                "recall": None,
                "f1_score": None,
                "dataset_trouve": True,
                "chemin_dataset": test_data_path,
                "note": f"Erreur lors de l'évaluation: {str(e)}"
            }


def preprocess_audio(audio_path):
    """
    Preprocesses the audio file:
    1. Load 16kHz mono
    2. Trim silence
    3. Pad/Truncate to 5.0 seconds
    4. Mel Spectrogram (128 mels, 157 steps - adjust if your M1 uses different shape)
    5. Format as (1, 128, 157, 1) tensor
    """
    try:
        print("   -> Début Librosa : Chargement de l'audio...")
        # Load audio
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        print(f"   -> Audio chargé avec succès (sr={sr}, longueur={len(y)} samples)")
        
        # Trim silence
        intervals = librosa.effects.split(y, top_db=35)
        if len(intervals) > 0:
            segments = [y[s:e] for s, e in intervals]
            y = np.concatenate(segments)
        
        # Force 5s duration (16000 * 5 = 80000 samples)
        target_length = 80000
        if len(y) > target_length:
            y = y[:target_length]
        else:
            y = np.pad(y, (0, max(0, target_length - len(y))), "constant")

        # Mel Spectrogram
        # Parameters typically depend on how the original model was trained
        # In this plan: 128 mels, 157 steps approximation depending on hop_length
        melspec = librosa.feature.melspectrogram(y=y, sr=16000, n_mels=128, n_fft=2048, hop_length=512, fmax=8000)
        melspec_db = librosa.power_to_db(melspec, ref=np.max)
        
        # Note: the exact expected shape of your CNN might differ slightly (e.g., 128x157)
        # We ensure it can fit generic format: Time axis x Mel axis
        # Here we do a standard reshape. 
        # (157 comes from 80000/512 = 156.25 -> 157 frames)
        if melspec_db.shape[1] > 157:
            melspec_db = melspec_db[:, :157]
        elif melspec_db.shape[1] < 157:
            melspec_db = np.pad(melspec_db, ((0,0), (0, 157 - melspec_db.shape[1])), "constant")

        # Shape becomes (128, 157) -> adding batch & channel -> (1, 128, 157, 1)
        tensor = melspec_db.reshape(1, 128, 157, 1)
        print(f"   -> Fin Librosa : Tensor généré avec succès (shape={tensor.shape})")
        return tensor
        
    except Exception as e:
        print(f"   -> ERREUR Critique lors du prétraitement Librosa : {str(e)}")
        logger.error(f"Error processing audio: {e}")
        raise ValueError(f"Erreur Librosa lors du prétraitement du fichier audio : {str(e)}")

def preprocess_audio_m3(audio_path):
    """
    Preprocesses audio specifically for M3 Standard which expects (40, 200, 1) MFCC features.
    """
    try:
        y, sr = librosa.load(audio_path, sr=16000, mono=True)
        intervals = librosa.effects.split(y, top_db=35)
        if len(intervals) > 0:
            segments = [y[s:e] for s, e in intervals]
            y = np.concatenate(segments)
        
        target_length = 80000
        if len(y) > target_length:
            y = y[:target_length]
        else:
            y = np.pad(y, (0, max(0, target_length - len(y))), "constant")

        # M3 was trained on MFCCs with 40 bands and 200 frames
        mfcc = librosa.feature.mfcc(y=y, sr=16000, n_mfcc=40, n_fft=2048, hop_length=400)
        
        if mfcc.shape[1] > 200:
            mfcc = mfcc[:, :200]
        elif mfcc.shape[1] < 200:
            mfcc = np.pad(mfcc, ((0,0), (0, 200 - mfcc.shape[1])), "constant")

        tensor = mfcc.reshape(1, 40, 200, 1)
        return tensor
    except Exception as e:
        logger.error(f"Error processing audio for M3: {e}")
        raise ValueError(f"Erreur Librosa lors du prétraitement M3 : {str(e)}")

def build_response(decision, audio_valide, chemin, confiances, metriques_modeles, 
                   last_probs, last_top3, code, famille=None, sous_dialecte=None):
    """Construit la réponse JSON standardisée."""
    # Récupérer les métriques du dernier modèle utilisé
    model_accuracy = None
    metrics = None
    
    # Trouver le dernier modèle avec des métriques
    for step in reversed(chemin):
        model_key = None
        if "M1" in step["modele"]:
            model_key = "M1_Routeur"
        elif "M3" in step["modele"]:
            model_key = "M3_Standard"
        elif "M2" in step["modele"]:
            model_key = "M2_Local"
        elif "M5" in step["modele"]:
            model_key = "M5_Darija"
        elif "M4" in step["modele"]:
            model_key = "M4_Amazigh"
        
        if model_key and model_key in metriques_modeles:
            m = metriques_modeles[model_key]
            if m.get("accuracy") is not None:
                model_accuracy = round(m["accuracy"] * 100, 2)
                metrics = {
                    "precision": m.get("precision"),
                    "recall": m.get("recall"),
                    "f1_score": m.get("f1_score")
                }
                break
    
    response = {
        "decision_finale": decision,
        "confidence": round(np.mean(confiances), 2) if confiances else 0,
        "probabilities": last_probs if last_probs else {},
        "top_3": last_top3 if last_top3 else [],
        "model_accuracy": model_accuracy,
        "metrics": metrics,
        "audio_valide": audio_valide,
        "code": code,
        "chemin": chemin,
        "details": {
            "confiance_moyenne": round(np.mean(confiances), 4) if confiances else 0,
            "confiance_min": round(np.min(confiances), 4) if confiances else 0,
            "confiance_max": round(np.max(confiances), 4) if confiances else 0,
            "nbr_modeles_utilises": len(confiances)
        }
    }
    
    if famille:
        response["famille"] = famille
    if sous_dialecte:
        response["sous_dialecte"] = sous_dialecte
    if metriques_modeles:
        response["all_models_metrics"] = metriques_modeles
    
    return response

def process_audio_pipeline(audio_path):
    """
    Executes the hierarchical classification pipeline.
    Returns the JSON-compatible dictionary structure with confidence scores, top-3 predictions, and model accuracy.
    """
    tensor = preprocess_audio(audio_path)
    if tensor is None:
        raise ValueError("Le prétraitement a échoué (Tensor est None)")

    print(f"   -> [DEBUG] Modèle Input Shape: {tensor.shape}")
    print(f"   -> [DEBUG] Tensor Mean: {np.mean(tensor):.2f}, Min: {np.min(tensor):.2f}, Max: {np.max(tensor):.2f}")

    print("   -> Début Prédiction : Orchestration des modèles...")
    orchestrator = ModelOrchestrator()
    chemin_parcouru = []
    etape_count = 1
    confiances = []  # Pour calculer la confiance moyenne
    last_probs = None
    last_top3 = None
    
    # Évaluation des modèles (si dataset disponible)
    metriques_modeles = {}

    # --- ÉTAPE 1: ROUTEUR (M1) ---
    print(f"      - Exécution M1_Routeur...")
    pred_m1, conf_m1, probs_m1, top3_m1 = orchestrator.predict("M1_Routeur", tensor)
    confiances.append(conf_m1)
    print(f"      - Résultat M1: {pred_m1} (Confiance: {conf_m1}%)")
    print(f"      - Top 3: {top3_m1}")
    
    chemin_parcouru.append({
        "etape": etape_count,
        "modele": "M1 (Routeur)",
        "prediction": pred_m1,
        "confiance": conf_m1,
        "probabilites": probs_m1,
        "top_3": top3_m1,
        "icone": "route"
    })
    
    # Évaluer le modèle M1
    metriques_m1 = orchestrator.evaluate_model("M1_Routeur")
    if metriques_m1:
        metriques_modeles["M1_Routeur"] = metriques_m1
    
    etape_count += 1

    if pred_m1 == "Bruit":
        return build_response(
            decision="Audio non valide - Trop de bruit",
            audio_valide=False,
            chemin=chemin_parcouru,
            confiances=confiances,
            metriques_modeles=metriques_modeles,
            last_probs=probs_m1,
            last_top3=top3_m1,
            code="BRUIT"
        )

    # --- ÉTAPE 2A: BRANCHE STANDARD (M3) ---
    if pred_m1 == "Standard":
        print(f"      -> Routing to M3 (Standard)...")
        # Generates the 40x200 MFCC tensor expected by M3_Standard
        tensor_m3 = preprocess_audio_m3(audio_path)
        print(f"   -> [DEBUG] Modèle M3 Input Shape: {tensor_m3.shape}")
        pred_m3, conf_m3, probs_m3, top3_m3 = orchestrator.predict("M3_Standard", tensor_m3)
        confiances.append(conf_m3)
        print(f"      - Résultat M3: {pred_m3} (Confiance: {conf_m3}%)")
        print(f"      - Top 3: {top3_m3}")
        
        chemin_parcouru.append({
            "etape": etape_count,
            "modele": "M3 (Langues Standards)",
            "prediction": pred_m3,
            "confiance": conf_m3,
            "probabilites": probs_m3,
            "top_3": top3_m3,
            "icone": "globe"
        })
        
        # Évaluer le modèle M3
        metriques_m3 = orchestrator.evaluate_model("M3_Standard")
        if metriques_m3:
            metriques_modeles["M3_Standard"] = metriques_m3
        
        return build_response(
            decision=pred_m3,
            audio_valide=True,
            chemin=chemin_parcouru,
            confiances=confiances,
            metriques_modeles=metriques_modeles,
            last_probs=probs_m3,
            last_top3=top3_m3,
            code="STD",
            famille="Standard"
        )

    # --- ÉTAPE 2B: BRANCHE LOCAL (M2) ---
    if pred_m1 == "Local":
        print(f"      -> Routing to M2 (Local)...")
        pred_m2, conf_m2, probs_m2, top3_m2 = orchestrator.predict("M2_Local", tensor)
        confiances.append(conf_m2)
        print(f"      - Résultat M2: {pred_m2} (Confiance: {conf_m2}%)")
        print(f"      - Top 3: {top3_m2}")
        
        chemin_parcouru.append({
            "etape": etape_count,
            "modele": "M2 (Famille Locale)",
            "prediction": pred_m2,
            "confiance": conf_m2,
            "probabilites": probs_m2,
            "top_3": top3_m2,
            "icone": "home"
        })
        
        # Évaluer le modèle M2
        metriques_m2 = orchestrator.evaluate_model("M2_Local")
        if metriques_m2:
            metriques_modeles["M2_Local"] = metriques_m2
        
        etape_count += 1

        # --- ÉTAPE 3: SOUS-DIALECTES ---
        if pred_m2 == "Darija":
            print(f"      -> Routing to M5 (Darija Dialects)...")
            # Modèle 5 (Darija)
            pred_m5, conf_m5, probs_m5, top3_m5 = orchestrator.predict("M5_Darija", tensor)
            confiances.append(conf_m5)
            print(f"      - Résultat M5: {pred_m5} (Confiance: {conf_m5}%)")
            print(f"      - Top 3: {top3_m5}")
            
            chemin_parcouru.append({
                "etape": etape_count,
                "modele": "M5 (Dialectes Darija)",
                "prediction": pred_m5,
                "confiance": conf_m5,
                "probabilites": probs_m5,
                "top_3": top3_m5,
                "icone": "map-pin"
            })
            
            # Évaluer le modèle M5
            metriques_m5 = orchestrator.evaluate_model("M5_Darija")
            if metriques_m5:
                metriques_modeles["M5_Darija"] = metriques_m5
            
            return build_response(
                decision=f"Darija - {pred_m5}",
                audio_valide=True,
                chemin=chemin_parcouru,
                confiances=confiances,
                metriques_modeles=metriques_modeles,
                last_probs=probs_m5,
                last_top3=top3_m5,
                code="DAR",
                famille="Darija",
                sous_dialecte=pred_m5
            )

        elif pred_m2 == "Amazigh":
            print(f"      -> Routing to M4 (Amazigh Dialects)...")
            # Modèle 4 (Amazigh)
            pred_m4, conf_m4, probs_m4, top3_m4 = orchestrator.predict("M4_Amazigh", tensor)
            confiances.append(conf_m4)
            print(f"      - Résultat M4: {pred_m4} (Confiance: {conf_m4}%)")
            print(f"      - Top 3: {top3_m4}")
            
            chemin_parcouru.append({
                "etape": etape_count,
                "modele": "M4 (Dialectes Amazigh)",
                "prediction": pred_m4,
                "confiance": conf_m4,
                "probabilites": probs_m4,
                "top_3": top3_m4,
                "icone": "mountain"
            })
            
            # Évaluer le modèle M4
            metriques_m4 = orchestrator.evaluate_model("M4_Amazigh")
            if metriques_m4:
                metriques_modeles["M4_Amazigh"] = metriques_m4
            
            return build_response(
                decision=f"Amazigh - {pred_m4}",
                audio_valide=True,
                chemin=chemin_parcouru,
                confiances=confiances,
                metriques_modeles=metriques_modeles,
                last_probs=probs_m4,
                last_top3=top3_m4,
                code="AMZ",
                famille="Amazigh",
                sous_dialecte=pred_m4
            )

    # Failsafe
    return build_response(
        decision="Inconnu",
        audio_valide=False,
        chemin=chemin_parcouru,
        confiances=confiances,
        metriques_modeles=metriques_modeles,
        last_probs=None,
        last_top3=None,
        code="ERR"
    )
