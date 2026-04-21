from rest_framework.views import APIView
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import tempfile
import os
import numpy as np
import librosa
from .services.ml_pipeline import process_audio_pipeline
from .services.routeur import process_audio_file


class ProcessAudioView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        print(f"\n Requête reçue sur l'API, méthode : {request.method}")
        print("====== NOUVELLE REQUÊTE DE PRÉDICTION ======")
        temp_path = None
        try:
            if 'audio' not in request.FILES:
                print("Erreur : Aucun fichier audio fourni")
                return Response({"error": "No audio file provided"}, status=status.HTTP_400_BAD_REQUEST)

            audio_file = request.FILES['audio']
            print(f"1. Fichier reçu : {audio_file.name} (Taille : {audio_file.size} octets)")
            
            # Save to a temporary file for librosa to load
            fd, temp_path = tempfile.mkstemp(suffix=".wav")
            with os.fdopen(fd, 'wb') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)
            print(f"2. Fichier temporaire sauvegardé : {temp_path}")
            
            print("3. Début du traîtement de l'audio (Librosa + Prédiction)...")
            # Run the ML pipeline
            result_json = process_audio_pipeline(temp_path)
            
            print("4. Traitement terminé avec succès !")
            print("====== FIN DE LA REQUÊTE ======\n")
            return Response(result_json, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"ERREUR FATALE : {str(e)}")
            print("====== FIN DE LA REQUÊTE AVEC ERREUR ======\n")
            return Response({"error": f"Erreur serveur : {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        finally:
            # Clean up temp file
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
                print(f"5. Nettoyage : Fichier temporaire supprimé ({temp_path})")


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def route_audio(request):
    """
    Endpoint pour le routage audio uniquement (modèle CNN Routeur).
    
    POST /api/route-audio/
    
    Body:
        - audio: fichier audio (wav, mp3, etc.)
        - seuil_confiance: float optionnel (défaut: 0.65)
    
    Response:
        {
            "prediction": "local|standard|other",
            "confiance": 0.87,
            "route": "modele2|whisper|rejeter|uncertain",
            "probs": [0.87, 0.1, 0.03],
            "seuil_atteint": true
        }
    """
    import logging
    logger = logging.getLogger(__name__)
    
    print(f"\n[ROUTEUR]Nouvelle requête de routage audio")
    print("=" * 50)
    
    try:
        # 1. Vérifier la présence du fichier audio
        if 'audio' not in request.FILES:
            logger.error("Aucun fichier audio fourni")
            return Response(
                {"error": "Aucun fichier audio fourni. Utilisez le champ 'audio'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        audio_file = request.FILES['audio']
        print(f"Fichier reçu: {audio_file.name} ({audio_file.size} octets)")
        
        # 2. Récupérer le seuil de confiance (optionnel)
        seuil_confiance = float(request.data.get('seuil_confiance', 0.65))
        print(f"Seuil de confiance: {seuil_confiance}")
        
        # 3. Récupérer le modèle routeur chargé (depuis apps.py via singleton)
        from .apps import ApiConfig
        modele = ApiConfig.get_model('routeur')
        
        if modele is None:
            print("Modèle non chargé - Mode MOCK activé")
        else:
            print("Modèle Routeur chargé en mémoire")
        
        # 4. Traiter le fichier audio
        result = process_audio_file(audio_file, modele, seuil_confiance)
        
        print(f"Résultat: {result['prediction']} ({result['confiance']}) -> {result['route']}")
        print("=" * 50 + "\n")
        
        return Response(result, status=status.HTTP_200_OK)
        
    except ValueError as e:
        logger.error(f"Erreur de valeur: {e}")
        return Response(
            {"error": f"Paramètre invalide: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Erreur serveur: {e}")
        return Response(
            {"error": f"Erreur serveur: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
