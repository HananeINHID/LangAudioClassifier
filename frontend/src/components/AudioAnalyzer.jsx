import { useState, useRef } from 'react';
import { routeAudio } from '../services/api';

const NIVEAUX_LABELS = {
  niveau1: 'Niveau 1 — Routeur',
  niveau2: 'Niveau 2 — Famille',
  niveau3: 'Niveau 3 — Dialecte final',
};

function BarreProba({ label, valeur, max }) {
  const pct = max > 0 ? Math.round((valeur / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-slate-600 text-sm w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-slate-200 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-slate-600 text-sm w-12 text-right shrink-0">
        {(valeur * 100).toFixed(1)}%
      </span>
    </div>
  );
}

function NiveauCard({ titre, niveau }) {
  if (!niveau) return null;

  if (!niveau.disponible) {
    return (
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-500 text-sm font-medium mb-1">{titre}</p>
        <p className="text-yellow-500 text-sm">⏳ {niveau.message}</p>
      </div>
    );
  }

  const probs   = niveau.probabilites || {};
  const maxProb = Math.max(...Object.values(probs));

  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {titre}
        </p>
        <span className="px-2 py-1 bg-indigo-50 text-indigo-600
                         text-xs font-semibold rounded-lg">
          {Math.round((niveau.confiance ?? 0) * 100)}%
        </span>
      </div>

      {/* Classe prédite */}
      <p className="text-2xl font-bold text-slate-900 mb-4">
        {niveau.classe}
      </p>

      {/* Barres probabilités */}
      {Object.keys(probs).length > 0 && (
        <div className="space-y-1">
          {Object.entries(probs).map(([cls, prob]) => (
            <BarreProba key={cls} label={cls} valeur={prob} max={maxProb} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AudioAnalyzer() {
  const [fichier,    setFichier]    = useState(null);
  const [audioUrl,   setAudioUrl]   = useState(null);
  const [resultat,   setResultat]   = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [erreur,     setErreur]     = useState(null);
  const [recording,  setRecording]  = useState(false);

  const mediaRef   = useRef(null);
  const chunksRef  = useRef([]);
  const fileInput  = useRef(null);

  /* ── Upload fichier ─────────────────────────────────── */
  function onFichierChoisi(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFichier(f);
    setAudioUrl(URL.createObjectURL(f));
    setResultat(null);
    setErreur(null);
  }

  /* ── Enregistrement micro ────────────────────────────── */
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr     = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'enregistrement.webm', { type: 'audio/webm' });
        setFichier(file);
        setAudioUrl(URL.createObjectURL(blob));
        setResultat(null);
        setErreur(null);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      setErreur("Impossible d'accéder au microphone.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop());
    setRecording(false);
  }

  /* ── Analyse ─────────────────────────────────────────── */
  async function analyser() {
    if (!fichier) return;
    setLoading(true);
    setErreur(null);
    setResultat(null);
    try {
      const res = await routeAudio(fichier);
      setResultat(res);
    } catch (err) {
      setErreur(err.response?.data?.error || "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Reset ───────────────────────────────────────────── */
  function reset() {
    setFichier(null);
    setAudioUrl(null);
    setResultat(null);
    setErreur(null);
  }

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Titre page */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2 text-slate-900">Analyse Audio</h1>
          <p className="text-slate-500">
            Uploadez un fichier ou enregistrez votre voix
            pour identifier la langue et le dialecte.
          </p>
        </div>

        {/* Grid 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── Colonne gauche ─────────────────────────── */}
          <div className="space-y-6">

            {/* Input cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Micro */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl
                                  flex items-center justify-center text-xl">
                    🎙️
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Enregistrer</p>
                    <p className="text-slate-500 text-sm">Depuis votre microphone</p>
                  </div>
                </div>
                <button
                  onClick={recording ? stopRecording : startRecording}
                  className={`w-full py-3 rounded-xl font-semibold text-white
                              transition-all duration-200
                              ${recording
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                                : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {recording ? '⏹ Arrêter' : '▶ Démarrer'}
                </button>
              </div>

              {/* Upload */}
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl
                                  flex items-center justify-center text-xl">
                    📁
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Téléverser</p>
                    <p className="text-slate-500 text-sm">WAV, MP3, OGG, WEBM</p>
                  </div>
                </div>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="w-full py-3 rounded-xl font-semibold border
                             border-slate-200 hover:border-slate-300 hover:bg-slate-50
                             text-slate-700 transition-all duration-200">
                  Choisir un fichier
                </button>
                <input
                  ref={fileInput} type="file"
                  accept="audio/*" className="hidden"
                  onChange={onFichierChoisi}
                />
              </div>
            </div>

            {/* Preview + bouton analyser */}
            {fichier && (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{fichier.name}</p>
                      <p className="text-slate-500 text-xs">
                        {(fichier.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button onClick={reset}
                          className="text-slate-500 hover:text-red-500
                                     transition-colors text-sm">
                    ✕ Supprimer
                  </button>
                </div>

                {audioUrl && (
                  <audio controls src={audioUrl}
                         className="w-full rounded-lg" />
                )}

                <button
                  onClick={analyser}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-semibold rounded-xl
                             transition-all duration-200">
                  {loading ? '⏳ Analyse en cours...' : '🚀 Lancer la prédiction IA'}
                </button>
              </div>
            )}

            {/* Erreur */}
            {erreur && (
              <div className="p-4 bg-red-50 border border-red-200
                              rounded-xl text-red-600 text-sm">
                ⚠️ {erreur}
              </div>
            )}

            {/* ── Résultats pipeline ───────────────────── */}
            {resultat && (
              <div className="space-y-4">

                {/* Décision finale */}
                <div className="p-6 bg-indigo-600 rounded-2xl text-white">
                  <p className="text-indigo-200 text-sm mb-1">Décision finale</p>
                  <p className="text-3xl font-bold text-white">
                    {resultat.decision_finale ?? resultat.classe_predite}
                  </p>
                  <p className="text-indigo-200 text-sm mt-2">
                    Confiance globale :
                    {' '}{Math.round((resultat.confiance ?? 0) * 100)}%
                  </p>
                </div>

                {/* Niveaux pipeline */}
                <NiveauCard
                  titre={NIVEAUX_LABELS.niveau1}
                  niveau={resultat.pipeline?.niveau1}
                />
                <NiveauCard
                  titre={NIVEAUX_LABELS.niveau2}
                  niveau={resultat.pipeline?.niveau2}
                />
                {resultat.pipeline?.niveau3?.disponible !== false &&
                 resultat.pipeline?.niveau3 && (
                  <NiveauCard
                    titre={NIVEAUX_LABELS.niveau3}
                    niveau={resultat.pipeline?.niveau3}
                  />
                )}

                {/* Bouton reset */}
                <button onClick={reset}
                        className="w-full py-3 border border-slate-200
                                   hover:bg-slate-50 text-slate-600
                                   rounded-xl transition-all duration-200">
                  🔄 Nouvelle analyse
                </button>
              </div>
            )}
          </div>

          {/* ── Colonne droite — info fixe ─────────────── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* Pipeline info */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                ⚡ Pipeline ML
              </p>
              <div className="space-y-3">
                {[
                  { n:'1', t:'Routeur',       d:'Local / Standard / Bruit'    },
                  { n:'2', t:'Famille',        d:'Darija / Amazigh / FR/EN/AR' },
                  { n:'3', t:'Sous-dialecte',  d:'Accent précis'              },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-indigo-50 text-indigo-600
                                     rounded-full flex items-center justify-center
                                     text-xs font-bold shrink-0 mt-0.5">
                      {n}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{t}</p>
                      <p className="text-slate-500 text-xs">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formats */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <p className="font-semibold text-slate-900 mb-3">📎 Formats supportés</p>
              <div className="flex flex-wrap gap-2">
                {['WAV','MP3','OGG','WEBM','M4A'].map(f => (
                  <span key={f}
                        className="px-3 py-1 bg-slate-100 rounded-lg
                                   text-slate-600 text-xs font-mono">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-3">
                Taille max : 10MB · Durée : 1–30 secondes
              </p>
            </div>

            {/* Conseils */}
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="font-semibold mb-3 text-amber-700">💡 Conseils</p>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li>• Environnement calme</li>
                <li>• Parlez clairement</li>
                <li>• Évitez les bruits de fond</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
