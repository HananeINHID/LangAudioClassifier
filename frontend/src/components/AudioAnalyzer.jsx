import { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Activity, AlertCircle, Loader2, RotateCcw, Zap } from 'lucide-react';
import { routeAudio } from '../services/api';

export default function AudioAnalyzer() {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [recordingStatus, setRecordingStatus] = useState('Prêt');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Nettoyage de l'URL mémoire pour éviter les fuites
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // GESTION DE L'ENREGISTREMENT MICROPHONE
  const startRecording = async () => {
    try {
      setErreur('');
      setResultat(null);
      setRecordingStatus('Demande d\'accès micro...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], 'enregistrement.webm', { type: 'audio/webm' });
        setAudioFile(file);
        setAudioUrl(url);
        chunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
        setRecordingStatus('Enregistrement terminé');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingStatus('Enregistrement en cours...');

    } catch (err) {
      setErreur('Accès au microphone refusé ou introuvable.');
      setRecordingStatus('Erreur micro');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // GESTION DE L'UPLOAD DE FICHIER
  const handleFileUpload = (e) => {
    setErreur('');
    setResultat(null);
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setErreur('Veuillez sélectionner un fichier audio valide.');
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioUrl(url);
      setRecordingStatus('Fichier téléversé');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setResultat(null);
    setErreur('');
    setIsRecording(false);
    setRecordingStatus('Prêt');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ENVOI AU BACKEND DJANGO
  const analyzeAudio = async () => {
    if (!audioFile) return;
    setIsLoading(true);
    setErreur('');
    setResultat(null);

    try {
      console.log('📤 Envoi du fichier:', audioFile.name, 'Taille:', audioFile.size);
      const data = await routeAudio(audioFile);
      console.log('📥 Réponse reçue:', data);

      // Vérification de la structure de la réponse
      // normalizeResponse() garantit que classe_predite ET prediction sont toujours définis.
      // On vérifie uniquement que la réponse n'est pas vide.
      if (!data || (!data.classe_predite && !data.prediction)) {
        throw new Error('Réponse API invalide — aucune prédiction retournée par le serveur.');
      }

      setResultat({ ...data, _timestamp: Date.now() });
    } catch (err) {
      console.error('❌ Erreur analyse:', err);
      const detail = err.response?.data?.detail;
      setErreur(
        detail
          ? `Erreur serveur FastAPI : ${detail}`
          : (err.message || "Impossible de joindre l'API FastAPI. Vérifiez que uvicorn tourne sur le port 8000.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteLabel = (route) => {
    const labels = {
      modele2: 'Pipeline Local (Darija/Amazigh)',
      whisper: 'Pipeline Standard (Whisper)',
      rejeter: 'Audio rejeté (Bruit)',
      uncertain: 'Confiance insuffisante',
    };
    return labels[route] || route;
  };

  const getRouteColor = (route) => {
    const colors = {
      modele2: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      whisper: 'bg-blue-100 text-blue-700 border-blue-200',
      rejeter: 'bg-red-100 text-red-700 border-red-200',
      uncertain: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return colors[route] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-8 md:p-12 overflow-hidden relative">

        {/* En-tête de Carte */}
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <Activity className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">DÉTECTION DE LANGUE ET DIALECTE AUDIO</h1>
            <p className="text-lg text-gray-500 mt-1">Analysez instantanément vos enregistrements ou fichiers.</p>
          </div>
        </div>

        {/* Bouton Reset (visible si fichier sélectionné) */}
        {audioFile && (
          <button
            onClick={handleReset}
            className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Nouvelle analyse"
          >
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
        )}

        {/* Corps de Carte (Responsive Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Carte Action 1 : Micro */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-between gap-4">
            <div className='flex flex-col items-center gap-2 text-center'>
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-2">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Enregistrer un audio</h2>
              <p className="text-sm text-gray-500">Utilisez votre microphone librement.</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${isRecording ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}>
                Status: {recordingStatus}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3 w-full">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-2 justify-center shadow-lg shadow-red-100 transition duration-150"
                >
                  <span className="w-4 h-4 bg-white rounded-sm"></span>
                  Arrêter l'enregistrement
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center gap-3 justify-center shadow-lg shadow-blue-100 transition duration-150"
                >
                  <Mic className="w-5 h-5" />
                  Démarrer l'enregistrement
                </button>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  Enregistrement libre, pas d'auto-stop
                </div>
              )}
            </div>
          </div>

          {/* Carte Action 2 : Upload */}
          <div
            className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-between gap-4 relative hover:border-blue-200 transition cursor-pointer"
            onClick={handleUploadClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className='flex flex-col items-center gap-2 text-center'>
              <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mb-2">
                <Upload className="w-8 h-8 text-gray-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Téléverser un fichier</h2>
              <p className="text-sm text-gray-500">Formats supportés (MP3, WAV, etc.)</p>
            </div>

            <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-8 rounded-xl flex items-center gap-3 justify-center border border-gray-300 transition duration-150 pointer-events-none">
              <Upload className="w-5 h-5" />
              Sélectionner un fichier
            </button>
          </div>
        </div>

        {/* Section Dynamique : Prévisualisation, Analyse & Résultats */}
        {audioUrl && !resultat && (
          <div className="bg-blue-50/50 rounded-3xl p-8 mb-10 border border-blue-100 flex flex-col items-center gap-6">
            <div className='w-full max-w-2xl flex flex-col items-center gap-4'>
              <p className="text-lg font-semibold text-gray-700 self-start">Votre audio est prêt pour l'analyse :</p>
              {audioFile && (
                <div className="w-full flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{audioFile.name}</p>
                    <p className="text-xs text-gray-500">{(audioFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              )}
              <audio controls src={audioUrl} className="w-full rounded-xl" />
            </div>

            <button
              onClick={analyzeAudio}
              disabled={isLoading}
              className={`w-full max-w-md py-4 px-10 rounded-xl font-extrabold text-white text-lg transition duration-150 shadow-xl ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-100'
                }`}
            >
              {isLoading ? (
                <div className='flex items-center gap-3 justify-center'>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  🧠 Analyse en cours...
                </div>
              ) : '🚀 Lancer la prédiction IA'}
            </button>
          </div>
        )}

        {/* Affichage des Erreurs */}
        {erreur && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-900 p-6 rounded-xl mb-10 shadow-lg shadow-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg">Erreur système</p>
                <p className='mt-1'>{erreur}</p>
              </div>
            </div>
          </div>
        )}

        {/* Affichage des Résultats de l'IA (Prominent & Stylisé) */}
        {resultat && (
          <div className="border border-green-100 bg-green-50 rounded-3xl p-8 shadow-2xl shadow-green-50" key={resultat._timestamp || Date.now()}>
            <div className='flex items-center gap-3 mb-6 pb-4 border-b border-green-100'>
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-green-900 uppercase tracking-tight">
                Résultat de l'analyse IA
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mb-6">
              <div className='bg-white p-6 rounded-2xl shadow-sm border border-green-100'>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Catégorie détectée</p>
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900 uppercase bg-green-100 px-4 py-2 rounded-lg inline-block">
                  {resultat.prediction}
                </p>
              </div>
              <div className="flex flex-col md:items-end gap-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Confiance du modèle</p>
                <div className='flex items-end gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-green-100 w-full md:w-auto'>
                  <p className="text-5xl md:text-6xl font-black text-green-700">{(resultat.confiance * 100).toFixed(0)}</p>
                  <p className="text-2xl font-bold text-green-500 mb-1">%</p>
                </div>
                {/* Barre de progression */}
                <div className="w-full md:w-48 h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${resultat.confiance * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* NIVEAU 1 — toujours affiché */}
            <div className="pipeline-niveau bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Niveau 1 — Routeur</h3>
              <p className="text-gray-900 text-lg">Catégorie : <strong>{resultat.classe_predite?.toUpperCase()}</strong></p>
              <p className="text-green-600 font-medium">Confiance : {(resultat.confiance * 100).toFixed(1)}%</p>
              {resultat.probabilites && (
                <div className="proba-bars mt-4 flex flex-col gap-2">
                  {Object.entries(resultat.probabilites).map(([cls, prob]) => (
                    <div key={cls} className="proba-row flex items-center gap-2 text-sm">
                      <span className="proba-label w-24 capitalize">{cls}</span>
                      <div className="proba-bar-bg flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="proba-bar-fill h-full bg-green-500 rounded-full" style={{width: `${prob*100}%`}}/>
                      </div>
                      <span className="proba-value w-12 text-right">{(prob*100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NIVEAU 2 */}
            {resultat.pipeline?.niveau2 && (
              <div className="pipeline-niveau bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {resultat.classe_predite === 'local'
                    ? 'Niveau 2 — Famille dialectale'
                    : 'Niveau 2 — Langue standard'}
                </h3>
                {resultat.pipeline.niveau2.disponible ? (
                  <>
                    <p className="text-gray-900 text-lg">
                      {resultat.classe_predite === 'local' ? 'Famille' : 'Langue'} :
                      <strong> {resultat.pipeline.niveau2.classe?.toUpperCase()}</strong>
                    </p>
                    <p className="text-green-600 font-medium">Confiance : {(resultat.pipeline.niveau2.confiance * 100).toFixed(1)}%</p>
                    {resultat.pipeline.niveau2.probabilites && (
                      <div className="proba-bars mt-4 flex flex-col gap-2">
                        {Object.entries(resultat.pipeline.niveau2.probabilites).map(([cls, prob]) => (
                          <div key={cls} className="proba-row flex items-center gap-2 text-sm">
                            <span className="proba-label w-24 capitalize">{cls}</span>
                            <div className="proba-bar-bg flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="proba-bar-fill h-full bg-blue-500 rounded-full" style={{width: `${prob*100}%`}}/>
                            </div>
                            <span className="proba-value w-12 text-right">{(prob*100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pending-badge flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                    <span className="text-2xl">⏳</span>
                    <p><strong>{resultat.pipeline.niveau2.message}</strong></p>
                  </div>
                )}
              </div>
            )}

            {/* NIVEAU 3 — uniquement si local */}
            {resultat.pipeline?.niveau3 && resultat.classe_predite === 'local' && (
              <div className="pipeline-niveau bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Niveau 3 —
                  {resultat.pipeline.niveau2?.classe === 'darija'
                    ? ' Accent Darija'
                    : ' Dialecte Amazigh'}
                </h3>
                {resultat.pipeline.niveau3.disponible ? (
                  <>
                    <p className="text-gray-900 text-lg">
                      {resultat.pipeline.niveau2?.classe === 'darija' ? 'Accent' : 'Dialecte'} :
                      <strong> {resultat.pipeline.niveau3.classe?.toUpperCase()}</strong>
                    </p>
                    <p className="text-green-600 font-medium">Confiance : {(resultat.pipeline.niveau3.confiance * 100).toFixed(1)}%</p>
                    {resultat.pipeline.niveau3.probabilites && (
                      <div className="proba-bars mt-4 flex flex-col gap-2">
                        {Object.entries(resultat.pipeline.niveau3.probabilites).map(([cls, prob]) => (
                          <div key={cls} className="proba-row flex items-center gap-2 text-sm">
                            <span className="proba-label w-24 capitalize">{cls}</span>
                            <div className="proba-bar-bg flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="proba-bar-fill h-full bg-purple-500 rounded-full" style={{width: `${prob*100}%`}}/>
                            </div>
                            <span className="proba-value w-12 text-right">{(prob*100).toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pending-badge flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
                    <span className="text-2xl">⏳</span>
                    <p><strong>{resultat.pipeline.niveau3.message}</strong></p>
                  </div>
                )}
              </div>
            )}

            {/* Bouton Nouvelle Analyse */}
            <div className="mt-6 pt-6 border-t border-green-100">
              <button
                onClick={handleReset}
                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle analyse
              </button>
            </div>

            {/* Debug - données brutes (Mission 3) */}
            {import.meta.env.DEV && (
              <details className="mt-4 p-3 bg-gray-800 rounded-lg text-xs font-mono text-green-400 overflow-auto">
                <summary className="cursor-pointer text-gray-400 mb-1">
                  Debug — Réponse API brute
                </summary>
                <pre style={{fontSize:'11px', overflow:'auto', maxHeight:'150px'}} className="mt-2">
                  {JSON.stringify(resultat, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
