import axios from 'axios';

const API_BASE = '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.request.use(
  (cfg) => { console.log('[API]', cfg.method?.toUpperCase(), cfg.url); return cfg; },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data || err.message);
    return Promise.reject(err);
  }
);

function normalizeResponse(data) {
  const chemin = data.chemin || [];
  const e1 = chemin[0] || null;
  const e2 = chemin[1] || null;
  const e3 = chemin[2] || null;

  const buildNiveau = (etape, absent_msg) => {
    if (!etape) return { disponible: false, message: absent_msg };
    return {
      disponible  : true,
      modele      : etape.modele,
      classe      : etape.prediction,
      confiance   : etape.confiance / 100,
      probabilites: etape.probabilites || {}
    };
  };

  return {
    classe_predite    : e1?.prediction        ?? 'inconnu',
    confiance         : (data.confidence ?? 0) / 100,
    decision_finale   : data.decision_finale   ?? null,
    famille           : data.famille           ?? null,
    sous_dialecte     : data.sous_dialecte     ?? null,
    probabilites      : data.probabilities     ?? {},
    statut            : data.audio_valide ? 'ok' : 'rejete',
    route             : data.code === 'DAR'    ? 'darija'
                      : data.code === 'AMZ'    ? 'amazigh'
                      : data.code === 'STD'    ? 'standard'
                      : data.code === 'BRUIT'  ? 'bruit'
                      : 'inconnu',
    temps_inference_ms: data.temps_inference_ms ?? null,
    pipeline: {
      niveau1: buildNiveau(e1, "Routeur non disponible"),
      niveau2: buildNiveau(e2, "Modèle en cours d'entraînement"),
      niveau3: buildNiveau(e3, e2 ? "Modèle en cours d'entraînement" : null),
    },
    _raw      : data,
    _timestamp: Date.now(),
  };
}

export async function predictAudio(audioFile) {
  const formData = new FormData();
  formData.append('audio', audioFile, audioFile.name || 'audio.wav');
  const res = await api.post('/api/predict/', formData);
  return normalizeResponse(res.data);
}

export async function getMetrics() {
  try {
    const res = await api.get('/api/metrics/');
    return res.data;
  } catch {
    return { error: "Endpoint /api/metrics/ non disponible", model_loaded: true };
  }
}

export async function getHealth() {
  try {
    const res = await api.get('/api/');
    return { status: 'ok', backend: 'django' };
  } catch {
    return { status: 'error', backend: 'django' };
  }
}

export const routeAudio = predictAudio;
export default api;
