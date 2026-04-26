import { Brain, ChevronRight, CheckCircle2 } from 'lucide-react';
import FadeIn from '../ui/FadeIn';

export default function PipelineSection() {
  return (
    <section id="pipeline" className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 text-sm font-semibold mb-4 border border-violet-500/30">
              <Brain className="w-4 h-4" />
              <span>Architecture ML</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Pipeline de Classification
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Notre architecture en cascade utilise 5 modèles spécialisés pour une classification ultra-précise.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Level 1 */}
          <FadeIn delay={0}>
            <div className="relative group">
              <div className="p-7 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-violet-500/50 hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center font-bold text-lg shadow-lg shadow-violet-500/25">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Routeur</h3>
                    <p className="text-xs text-violet-400 font-medium">Modèle M1</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />
                    <span className="font-medium">Local (Darija/Amazigh)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50" />
                    <span className="font-medium">Standard (FR/EN/AR)</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-500/50" />
                    <span className="font-medium">Bruit / Non-speech</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-full z-10">
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-violet-400" />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Level 2 */}
          <FadeIn delay={150}>
            <div className="relative group">
              <div className="p-7 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/25">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Classification</h3>
                    <p className="text-xs text-purple-400 font-medium">Modèles M2-M3</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50" />
                    <span className="font-medium">Darija ↔ Amazigh</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50" />
                    <span className="font-medium">FR / EN / Arabe Std</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-full z-10">
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Level 3 */}
          <FadeIn delay={300}>
            <div className="group">
              <div className="p-7 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-pink-500/50 hover:bg-slate-800 transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-pink-700 flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-500/25">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Affinement</h3>
                    <p className="text-xs text-pink-400 font-medium">Modèles M4-M5</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-lg shadow-orange-500/50" />
                    <span className="font-medium">Accents Darija</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-slate-700/50 p-2.5 rounded-lg">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-lg shadow-teal-500/50" />
                    <span className="font-medium">Dialectes Amazigh</span>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Trust indicators */}
        <FadeIn delay={400}>
          <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>95%+ Précision</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>&lt;1s Temps de réponse</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5 Modèles spécialisés</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
