import AudioAnalyzer from '../components/AudioAnalyzer';
import FadeIn from '../components/ui/FadeIn';
import { Mic, Info, ChevronRight, FileAudio, Clock, Sparkles, Brain, Zap, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const formats = ['WAV', 'MP3', 'OGG', 'WEBM', 'M4A'];
  
  const pipelineSteps = [
    { 
      n: 1, 
      label: 'Routeur', 
      sub: 'Local / Standard / Bruit', 
      desc: 'Classification initiale',
      color: 'from-indigo-500 to-indigo-600',
    },
    { 
      n: 2, 
      label: 'Classification', 
      sub: 'Famille dialectale', 
      desc: 'Identification langue',
      color: 'from-violet-500 to-violet-600',
    },
    { 
      n: 3, 
      label: 'Affinement', 
      sub: 'Accent / Sous-dialecte', 
      desc: 'Précision maximale',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Header - Enhanced */}
        <FadeIn>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Analyse Audio
                  </h1>
                  <p className="text-gray-500 dark:text-slate-400 text-sm">
                    Classification intelligente par IA
                  </p>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="flex items-center gap-4 sm:ml-auto">
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">&lt;1s analyse</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300">95% précision</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 md:gap-8 items-start">
          {/* Audio Analyzer — 2 columns */}
          <div className="min-w-0">
            <AudioAnalyzer />
          </div>

          {/* Sidebar - Enhanced */}
          <div className="space-y-5 sticky top-6">
            {/* How it works - Enhanced */}
            <FadeIn delay={100}>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-100 dark:border-indigo-900/30 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Comment ça marche</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-4">
                  Notre pipeline ML en 3 niveaux analyse votre audio pour une classification précise :
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span>Routeur détermine le type d'audio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <span>Classification de la famille dialectale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-pink-500 mt-0.5 shrink-0" />
                    <span>Affinement jusqu'à l'accent précis</span>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Pipeline Steps - Enhanced */}
            <FadeIn delay={150}>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-500" />
                  Pipeline ML
                </h3>
                <div className="space-y-4">
                  {pipelineSteps.map((step, idx) => (
                    <div key={step.n} className="relative">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
                          {step.n}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{step.label}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{step.sub}</p>
                          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{step.desc}</p>
                        </div>
                      </div>
                      {idx < pipelineSteps.length - 1 && (
                        <div className="absolute left-5 top-10 w-px h-4 bg-gray-200 dark:bg-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Formats - Enhanced */}
            <FadeIn delay={200}>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <FileAudio className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Formats supportés</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formats.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-xs font-semibold border border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors cursor-default"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">
                  Taille max: 10MB • Durée: 1-30 secondes
                </p>
              </div>
            </FadeIn>

            {/* Tips */}
            <FadeIn delay={250}>
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 transition-colors">
                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Conseils
                </h4>
                <ul className="text-xs text-amber-700 dark:text-amber-300/80 space-y-1.5">
                  <li>• Utilisez un environnement calme</li>
                  <li>• Parlez clairement et naturellement</li>
                  <li>• Évitez les bruits de fond</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
