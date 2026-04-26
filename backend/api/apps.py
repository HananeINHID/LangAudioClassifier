import os
from django.apps import AppConfig
from django.conf import settings


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    # Dictionnaire contenant tous les modèles chargés
    loaded_models = {}
    
    # Mapping des noms de modèles vers les fichiers .h5
    MODEL_FILES = {
        'routeur':   'models/modele1_routeur_meilleur.h5',
        'local':     'models/modele2_local.h5',             
        'standard':  'models/modele3_standard.h5',
        'amazigh':   'models/modele4_amazigh.h5',
        'darija':    'models/modele5_darija.h5',
    }
    
    def ready(self):
        """
        Appelé une seule fois au démarrage de Django.
        Charge uniquement les modèles dont le fichier .h5 existe réellement.
        compile=False évite les erreurs de Focal Loss custom non enregistrée.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Éviter le double chargement en mode debug (Django appelle ready() deux fois)
        if ApiConfig.loaded_models:
            return
        
        # ── Limiter OpenBLAS AVANT d'importer TensorFlow ──────────────
        # Évite l'erreur "Memory allocation still failed after 10 retries"
        os.environ.setdefault('OPENBLAS_NUM_THREADS', '1')
        os.environ.setdefault('OMP_NUM_THREADS', '1')
        os.environ.setdefault('MKL_NUM_THREADS', '1')
        os.environ.setdefault('TF_ENABLE_ONEDNN_OPTS', '0')

        try:
            import tensorflow as tf
            tf.config.threading.set_intra_op_parallelism_threads(1)
            tf.config.threading.set_inter_op_parallelism_threads(1)
        except Exception:
            pass

        try:
            import tensorflow as tf

            for model_name, rel_path in self.MODEL_FILES.items():
                model_path = os.path.join(settings.BASE_DIR, rel_path)
                model_path = os.path.normpath(model_path)

                if not os.path.exists(model_path):
                    logger.warning(f"Modele non trouve, skipped: {model_path}")
                    ApiConfig.loaded_models[model_name] = None
                    continue

                try:
                    logger.info(f"Chargement '{model_name}' depuis {model_path} ...")
                    # compile=False -> pas d'erreur si la Focal Loss custom est absente
                    model = tf.keras.models.load_model(model_path, compile=False)
                    ApiConfig.loaded_models[model_name] = model
                    logger.info(f"OK '{model_name}' charge.")
                except Exception as e:
                    logger.error(f"Erreur chargement '{model_name}': {e}")
                    ApiConfig.loaded_models[model_name] = None

            loaded = sum(1 for m in ApiConfig.loaded_models.values() if m is not None)
            logger.info(f"Modeles prets : {loaded}/{len(self.MODEL_FILES)}")

        except ImportError as e:
            logger.error(f"TensorFlow non disponible : {e}")
        except Exception as e:
            logger.error(f"Erreur globale apps.ready() : {e}")

    @classmethod
    def get_model(cls, name):
        """Récupère un modèle chargé par son nom."""
        return cls.loaded_models.get(name)

    @classmethod
    def get_routeur_model(cls):
        return cls.loaded_models.get('routeur')
