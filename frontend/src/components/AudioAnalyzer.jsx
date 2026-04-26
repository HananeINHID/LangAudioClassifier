import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Upload, Activity, AlertCircle, Loader2, RotateCcw, Zap, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { routeAudio } from '../services/api';
import Loader from './ui/Loader';

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

  // DRAG & DROP
  const onDrop = useCallback((acceptedFiles) => {
    setErreur('');
    setResultat(null);
    const file = acceptedFiles[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setErreur('Veuillez déposer un fichier audio valide.');
        return;
      }
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioUrl(url);
      setRecordingStatus('Fichier téléversé');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.ogg', '.webm', '.m4a'] },
    maxFiles: 1,
    noClick: true,
  });

  // ENVOI AU BACKEND
  const analyzeAudio = async () => {
    if (!audioFile) return;
    setIsLoading(true);
    setErreur('');
    setResultat(null);

    try {
      console.log('📤 Envoi du fichier:', audioFile.name, 'Taille:', audioFile.size);
      const data = await routeAudio(audioFile);
      console.log('📥 Réponse reçue:', data);

      if (!data || (!data.classe_predite && !data.prediction)) {
        throw new Error('Réponse API invalide — aucune prédiction retournée par le serveur.');
      }

      const resultWithTimestamp = { ...data, _timestamp: Date.now(), timestamp: Date.now() };
      setResultat(resultWithTimestamp);

      // Save to localStorage for history
      try {
        const existing = JSON.parse(localStorage.getItem('dialectid_analyses') || '[]');
        const updated = [resultWithTimestamp, ...existing].slice(0, 50);
        localStorage.setItem('dialectid_analyses', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving to history:', e);
      }
    } catch (err) {
      console.error('❌ Erreur analyse:', err);
      const detail = err.response?.data?.detail;
      setErreur(
        detail
          ? `Erreur serveur : ${detail}`
          : (err.message || "Impossible de joindre l'API. Vérifiez que le backend tourne.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════════════
     HELPER: Capitalize first letter
     ════════════════════════════════════════════════════════════ */
  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

  /* ══════════════════════════════════════════════════════════════
     HELPER: Build pipeline steps array from resultat.pipeline
     Reads niveau1 / niveau2 / niveau3 as returned by api.js
     ════════════════════════════════════════════════════════════ */
  const buildPipelineSteps = () => {
    if (!resultat) return [];
    const steps = [];
    const p = resultat.pipeline;

    // ── Niveau 1 — Routeur ──
    if (p?.niveau1) {
      const n1 = p.niveau1;
      steps.push({
        model: n1.modele || 'M1 Routeur',
        label: n1.disponible ? capitalize(n1.classe) : null,
        confidence: n1.disponible ? n1.confiance : null,
        completed: n1.disponible,
        pending: !n1.disponible,
        message: n1.message,
        probas: n1.probabilites,
        color: 'violet',
      });
    }

    // ── Niveau 2 — Classification ──
    if (p?.niveau2) {
      const n2 = p.niveau2;
      steps.push({
        model: n2.modele || 'M2/M3 Classification',
        label: n2.disponible ? capitalize(n2.classe) : null,
        confidence: n2.disponible ? n2.confiance : null,
        completed: n2.disponible,
        pending: !n2.disponible,
        message: n2.message,
        probas: n2.probabilites,
        color: 'purple',
      });
    }

    // ── Niveau 3 — Affinement (only shown if message or disponible) ──
    if (p?.niveau3 && (p.niveau3.disponible || p.niveau3.message)) {
      const n3 = p.niveau3;
      steps.push({
        model: n3.modele || 'M4/M5 Affinement',
        label: n3.disponible ? capitalize(n3.classe) : null,
        confidence: n3.disponible ? n3.confiance : null,
        completed: n3.disponible,
        pending: !n3.disponible,
        message: n3.message,
        probas: n3.probabilites,
        color: 'pink',
      });
    }

    return steps;
  };

  /* ══════════════════════════════════════════════════════════════
     HELPER: Compose the final prediction label
     Uses decision_finale from backend, fallback to pipeline chain
     ════════════════════════════════════════════════════════════ */
  const getFinalLabel = () => {
    if (!resultat) return '';

    // Primary: use decision_finale from backend
    if (resultat.decision_finale) {
      return capitalize(resultat.decision_finale);
    }

    // Fallback: build label from the deepest available pipeline step
    const parts = [];
    if (resultat.pipeline?.niveau1?.disponible) parts.push(resultat.pipeline.niveau1.classe);
    if (resultat.pipeline?.niveau2?.disponible) parts.push(resultat.pipeline.niveau2.classe);
    if (resultat.pipeline?.niveau3?.disponible) parts.push(resultat.pipeline.niveau3.classe);

    if (parts.length > 0) {
      return parts.filter(Boolean).map(capitalize).join(' — ');
    }

    // Last resort
    return capitalize(resultat.classe_predite) || 'Inconnu';
  };

  /* ══════════════════════════════════════════════════════════════
     SUB-COMPONENT: Probability Bars
     ════════════════════════════════════════════════════════════ */
  const ProbaBars = ({ probas, color = 'bg-violet-500' }) => {
    if (!probas) return null;
    return (
      <div className="mt-3 space-y-1.5">
        {Object.entries(probas).map(([cls, prob]) => (
          <div key={cls} className="flex items-center gap-2.5">
            <span className="w-16 text-xs text-gray-400 dark:text-slate-500 capitalize truncate">{cls}</span>
            <div className="flex-1 h-[6px] bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${Math.max(prob * 100, 1.5)}%` }}
              />
            </div>
            <span className="w-11 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
              {(prob * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  /* ══════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* ══════════ INPUT CARD ══════════ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        {/* File status bar */}
        {audioFile && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-indigo-50/80 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 font-medium min-w-0">
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{audioFile.name}</span>
              <span className="text-indigo-400 dark:text-indigo-500 text-xs shrink-0">
                ({(audioFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors shrink-0 ml-2"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
            </button>
          </div>
        )}

        <div className="p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ── Micro Card ── */}
            <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 p-5 flex flex-col items-center gap-3 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Enregistrer</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Depuis votre microphone</p>
              </div>

              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                  </span>
                  {recordingStatus}
                </div>
              )}

              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="w-3 h-3 bg-white rounded-sm" />
                  Arrêter
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <Mic className="w-4 h-4" />
                  Démarrer
                </button>
              )}
            </div>

            {/* ── Upload Card with Drag & Drop ── */}
            <div
              {...getRootProps()}
              className={`rounded-xl border-2 border-dashed p-5 flex flex-col items-center gap-3 cursor-pointer transition-all group ${
                isDragActive
                  ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-[1.02]'
                  : 'border-gray-200 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
              }`}
              onClick={handleUploadClick}
            >
              <input {...getInputProps()} />
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*,.ogg"
                onChange={handleFileUpload}
              />
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                isDragActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/40'
                  : 'bg-gray-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30'
              }`}>
                <Upload className={`w-5 h-5 transition-colors ${
                  isDragActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'
                }`} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {isDragActive ? 'Déposez ici' : 'Téléverser'}
                </h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                  {isDragActive ? 'Lâchez le fichier audio' : 'Glissez-déposez ou cliquez • MP3, WAV, OGG'}
                </p>
              </div>
              {!isDragActive && (
                <button className="w-full py-2.5 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 border border-gray-200 dark:border-slate-600 pointer-events-none group-hover:border-indigo-200 dark:group-hover:border-indigo-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Upload className="w-4 h-4" />
                  Choisir un fichier
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ DYNAMIC CONTENT (PREVIEW / LOADER / RESULTS) ══════════ */}
      <AnimatePresence mode="wait">
        {/* ── 1. PREVIEW ── */}
        {audioUrl && !resultat && !isLoading && (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-700 shadow-sm p-5 md:p-6 transition-colors"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Audio prêt pour l'analyse</p>
            </div>

            <audio controls src={audioUrl} className="w-full mb-4" />

            <button
              onClick={analyzeAudio}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/30 hover:scale-[1.015] active:scale-[0.99]"
            >
              <Zap className="w-4 h-4" />
              Lancer la prédiction IA
            </button>
          </motion.div>
        )}

        {/* ── 2. LOADING SKELETON ── */}
        {isLoading && (
          <Loader key="loader" />
        )}

        {/* ── 3. RESULTS ── */}
        {resultat && !isLoading && (() => {
          const steps = buildPipelineSteps();
          const finalLabel = getFinalLabel();
          const pct = Math.round((resultat.confiance ?? 0) * 100);

          return (
            <motion.div
              key={resultat._timestamp || Date.now()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden shadow-lg shadow-gray-200/60 dark:shadow-none border border-gray-200/60 dark:border-slate-700"
            >
            {/* ── 1. HERO HEADER — Gradient Card ── */}
            <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 px-6 md:px-8 py-8 md:py-10">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.07]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,white_1px,transparent_1px)] bg-[length:24px_24px]" />
              </div>

              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] mb-2">
                    Langue détectée
                  </p>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight tracking-tight truncate">
                    {finalLabel}
                  </h2>
                  {resultat.temps_inference_ms && (
                    <p className="text-white/40 text-xs mt-2">
                      Inférence en {resultat.temps_inference_ms}ms
                    </p>
                  )}
                </div>

                {/* Glassmorphism confidence badge */}
                <div className="self-start sm:self-auto shrink-0 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white leading-none">{pct}</span>
                    <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">%</span>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <span className="text-xs text-white/70 font-medium leading-tight">
                    Indice de<br />confiance
                  </span>
                </div>
              </div>

              {/* Confidence bar at bottom of hero */}
              <div className="relative mt-6 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* ── 2. PIPELINE TIMELINE ── */}
            <div className="bg-white dark:bg-slate-900 px-6 md:px-8 py-7 md:py-8 transition-colors">
              <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-6">
                Pipeline hiérarchique
              </p>

              <div className="relative">
                {steps.map((step, i) => {
                  const isLast = i === steps.length - 1;
                  const barColor = {
                    violet: 'bg-violet-500',
                    purple: 'bg-purple-500',
                    pink: 'bg-pink-500',
                  }[step.color] || 'bg-violet-500';

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 + 0.3 }}
                      className="relative flex gap-5"
                    >
                      {/* Timeline track */}
                      <div className="flex flex-col items-center">
                        {/* Checkmark circle */}
                        {step.completed ? (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 z-10">
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 z-10">
                            <span className="text-sm">⏳</span>
                          </div>
                        )}
                        {/* Connector line */}
                        {!isLast && (
                          <div className="w-px flex-1 bg-gray-200 dark:bg-slate-700 my-1" />
                        )}
                      </div>

                      {/* Step content */}
                      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-7'}`}>
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{step.model}</p>
                          {step.completed && step.confidence !== null && (
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-full shrink-0">
                              {Math.round((step.confidence ?? 0) * 100)}%
                            </span>
                          )}
                        </div>

                        {step.completed ? (
                          <>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{step.label}</p>
                            <ProbaBars probas={step.probas} color={barColor} />
                          </>
                        ) : (
                          <div className="flex items-center gap-2 py-1 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm mt-1">
                            <span className="font-medium">{step.message || 'Modèle en attente'}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* ── 3. CTA BUTTON ── */}
            <div className="bg-white dark:bg-slate-900 px-6 md:px-8 pb-6 md:pb-8 pt-2 transition-colors">
              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-800/30 hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle analyse
              </button>
            </div>

            {/* Debug — dev only */}
            {import.meta.env.DEV && (
              <div className="bg-gray-50 dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 px-6 md:px-8 py-3">
                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors font-medium">
                    Debug — Réponse API brute
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-900 dark:bg-slate-950 rounded-lg text-green-400 font-mono text-[11px] overflow-auto max-h-[120px] leading-relaxed">
                    {JSON.stringify(resultat, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </motion.div>
        );
      })()}
      </AnimatePresence>

      {/* ══════════ ERROR (outside AnimatePresence for persistence or could be inside) ══════════ */}
      {erreur && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300 text-sm">Erreur système</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-0.5">{erreur}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
