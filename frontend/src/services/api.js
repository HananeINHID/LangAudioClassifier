/**
 * services/api.js
 *
 * Couche d'appels HTTP vers le backend.
 * Backend actif : Django (port 8000) — endpoint /api/route-audio/
 * Pour basculer vers FastAPI : définir VITE_API_MODE=fastapi dans .env
 */
import axios from 'axios';

const MODE     = import.meta.env.VITE_API_MODE || 'fastapi';  // 'django' | 'fastapi'

// Utiliser une URL relative pour que le proxy Vite (défini dans vite.config.js) 
// intercepte les requêtes. Cela règle définitivement les erreurs CORS et "Network Error" 
// lors du test sur un téléphone ou un autre PC du réseau.
const API_BASE = '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.request.use(
  (cfg) => { console.log(`[API ${MODE.toUpperCase()}]`, cfg.method?.toUpperCase(), cfg.url); return cfg; },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

/* ── Normalisation réponse ─────────────────────────────────────
   Aligne les deux formats (Django legacy & FastAPI) vers un format
   commun attendu par AudioAnalyzer.jsx :
   { classe_predite, confiance, route, probabilites, statut }
*/
function normalizeResponse(data) {
  return {
    ...data,
    // FastAPI retourne classe_predite, Django retourne prediction
    classe_predite: data.classe_predite ?? data.prediction ?? 'inconnu',
    prediction:     data.classe_predite ?? data.prediction ?? 'inconnu',
    confiance:      data.confiance      ?? 0,
    route:          data.route          ?? 'rejeter',
    // FastAPI retourne probabilites {local, standard, bruit}
    // Django retourne probs [local_val, standard_val, bruit_val]
    probabilites: data.probabilites ?? (
      Array.isArray(data.probs)
        ? { local: data.probs[0] ?? 0, standard: data.probs[1] ?? 0, bruit: data.probs[2] ?? 0 }
        : {}
    ),
    statut:            data.statut            ?? 'ok',
    temps_inference_ms: data.temps_inference_ms ?? null,
    // Champs bruts pour debug
    _raw: data,
  };
}

/* ── predictAudio ────────────────────────────────────────────── */
export async function predictAudio(audioFile) {
  const formData = new FormData();

  if (MODE === 'fastapi') {
    // FastAPI attend le champ 'file'
    formData.append('file', audioFile, audioFile.name || 'audio.wav');
    const res = await api.post('/predict', formData);
    return normalizeResponse(res.data);
  } else {
    // Django attend le champ 'audio' sur /api/route-audio/
    formData.append('audio', audioFile, audioFile.name || 'audio.wav');
    const res = await api.post('/api/route-audio/', formData);
    return normalizeResponse(res.data);
  }
}

/* ── getMetrics ──────────────────────────────────────────────── */
export async function getMetrics() {
  if (MODE === 'fastapi') {
    const res = await api.get('/metrics');
    return res.data;
  }
  // Django n'a pas de /metrics — retourne un placeholder indiquant
  // qu'il faut générer test_results.json
  return {
    error: "L'endpoint /metrics n'est disponible que sur FastAPI. Lancez fastapi_backend.",
    model_loaded: true,
  };
}

/* ── getHealth ───────────────────────────────────────────────── */
export async function getHealth() {
  if (MODE === 'fastapi') {
    const res = await api.get('/health');
    return res.data;
  }
  try {
    await api.get('/api/');
    return { status: 'ok', backend: 'django' };
  } catch {
    return { status: 'error', backend: 'django' };
  }
}

/* ── routeAudio (alias legacy Django) ───────────────────────── */
export const routeAudio = predictAudio;

export default api;
