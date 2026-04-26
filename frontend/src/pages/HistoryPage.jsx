import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Trash2, Download, Mic, Calendar, ChevronRight, FileAudio, AlertCircle } from 'lucide-react';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = () => {
      try {
        const stored = localStorage.getItem('dialectid_analyses');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAnalyses(parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        }
      } catch (error) {
        console.error('Error loading analyses:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAnalyses();
  }, []);

  const clearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique ?')) {
      localStorage.removeItem('dialectid_analyses');
      setAnalyses([]);
    }
  };

  const deleteAnalysis = (timestamp) => {
    const updated = analyses.filter(a => a.timestamp !== timestamp);
    setAnalyses(updated);
    localStorage.setItem('dialectid_analyses', JSON.stringify(updated));
  };

  const exportAnalysis = (analysis) => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analysis-${analysis.timestamp}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    return new Date(timestamp).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getPredictionColor = (prediction) => {
    const colors = {
      local: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      standard: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      darija: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      amazigh: 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
      bruit: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    return colors[prediction?.toLowerCase()] || 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700';
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center animate-pulse">
            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-sm">Chargement…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <History className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Historique</h1>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {analyses.length} analyse{analyses.length !== 1 ? 's' : ''} enregistrée{analyses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {analyses.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tout supprimer
            </button>
          )}
        </div>

        {analyses.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-5">
              <FileAudio className="w-10 h-10 text-gray-300 dark:text-slate-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1.5">Aucune analyse</h2>
            <p className="text-gray-400 dark:text-slate-500 text-sm text-center max-w-sm mb-6">
              Vos résultats apparaîtront ici après avoir classifié des audios depuis le tableau de bord.
            </p>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
            >
              <Mic className="w-4 h-4" />
              Nouvelle analyse
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Analysis List */
          <div className="space-y-3">
            {analyses.map((analysis, index) => (
              <div
                key={analysis.timestamp || index}
                className="group p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200/60 dark:hover:border-indigo-800/60 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <FileAudio className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {/* Decision finale — the deepest classification result */}
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getPredictionColor(analysis.decision_finale || analysis.classe_predite)}`}>
                        {(analysis.decision_finale || analysis.classe_predite || 'Inconnu').toUpperCase()}
                      </span>
                      {/* Famille — ex: darija, amazigh, standard */}
                      {analysis.famille && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                          {analysis.famille.toUpperCase()}
                        </span>
                      )}
                      {/* Sous-dialecte — ex: chamaliya, souss */}
                      {analysis.sous_dialecte && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800">
                          {analysis.sous_dialecte.toUpperCase()}
                        </span>
                      )}
                      {/* Route badge — local/standard/bruit */}
                      {analysis.route && analysis.route !== 'inconnu' && (
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                          {analysis.route.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(analysis.timestamp)}
                      </span>
                      {analysis.confiance && (
                        <span>Confiance: {Math.round(analysis.confiance * 100)}%</span>
                      )}
                      {analysis.temps_inference_ms && (
                        <span>{analysis.temps_inference_ms}ms</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportAnalysis(analysis)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Exporter en JSON"
                    >
                      <Download className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                    </button>
                    <button
                      onClick={() => deleteAnalysis(analysis.timestamp)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Probabilities preview */}
                {analysis.probabilites && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(analysis.probabilites).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 dark:text-slate-500 capitalize">{key}</span>
                          <div className="w-20 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${(value * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-6 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 transition-colors">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-800 dark:text-slate-200 text-sm mb-0.5">Stockage local</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Les analyses sont stockées dans votre navigateur. Elles seront perdues si vous videz les données de navigation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
