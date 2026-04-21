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
        'routeur': 'modele1_routeur_meilleur.h5',
        'local': 'modele2_local.h5',
        'standard': 'modele3_standard.h5',
        'amazigh': 'modele4_amazigh.h5',
        'darija': 'modele5_darija.h5',
    }
    
    def ready(self):
        """
        Méthode appelée une seule fois au démarrage de Django.
        Charge les 5 modèles TensorFlow en mémoire pour éviter de les recharger à chaque requête.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        # Éviter le double chargement en mode debug
        if ApiConfig.loaded_models:
            logger.info("Modèles déjà chargés, skipping...")
            return
        
        try:
            import tensorflow as tf
            
            # Chemin vers le dossier models/ (à la racine du projet backend)
            models_dir = os.path.join(settings.BASE_DIR, 'models')
            
            logger.info(f"Chargement des modèles depuis: {models_dir}")
            
            # Charger chaque modèle
            for model_name, filename in self.MODEL_FILES.items():
                model_path = os.path.join(models_dir, filename)
                
                if os.path.exists(model_path):
                    try:
                        ApiConfig.loaded_models[model_name] = tf.keras.models.load_model(model_path)
                        logger.info(f"✅ Modèle '{model_name}' chargé: {filename}")
                    except Exception as e:
                        logger.error(f"❌ Erreur chargement '{model_name}': {e}")
                        ApiConfig.loaded_models[model_name] = None
                else:
                    logger.warning(f"⚠️ Fichier non trouvé: {model_path}")
                    ApiConfig.loaded_models[model_name] = None
            
            # Résumé
            loaded_count = sum(1 for m in ApiConfig.loaded_models.values() if m is not None)
            logger.info(f"Chargement terminé: {loaded_count}/{len(self.MODEL_FILES)} modèles prêts")
            
        except ImportError as e:
            logger.error(f"❌ Erreur import TensorFlow: {e}")
        except Exception as e:
            logger.error(f"❌ Erreur globale: {e}")
    
    @classmethod
    def get_model(cls, name):
        """
        Récupère un modèle chargé par son nom.
        
        Args:
            name: 'routeur', 'local', 'standard', 'amazigh', ou 'darija'
        
        Returns:
            Le modèle Keras ou None si non chargé
        """
        return cls.loaded_models.get(name)
    
    @classmethod
    def get_routeur_model(cls):
        """
        Raccourci pour récupérer le modèle routeur.
        """
        return cls.loaded_models.get('routeur')
