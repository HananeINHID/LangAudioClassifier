import { Mic, Upload, Brain, Zap, Globe, Shield, AudioLines } from 'lucide-react';
import FadeIn from '../ui/FadeIn';

const features = [
  {
    icon: Mic,
    title: 'Enregistrement Audio',
    description: 'Enregistrez directement depuis votre microphone avec une qualité optimale pour l\'analyse.',
    color: 'from-violet-500 to-purple-600',
  },
  {
    icon: Upload,
    title: 'Upload de Fichiers',
    description: 'Supporte les formats WAV, MP3, OGG, WEBM et M4A jusqu\'à 10MB.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'IA Avancée',
    description: 'Pipeline ML en 3 niveaux avec 5 modèles spécialisés pour une précision maximale.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Résultats Instantanés',
    description: 'Analyse en moins d\'une seconde avec visualisation détaillée des probabilités.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Dialectes Marocains',
    description: 'Détection fine du Darija (Chamal, Dakhil, Hassania) et Amazigh (Souss, Atlas, Rif).',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Shield,
    title: 'Respect de la Vie Privée',
    description: 'Vos données audio ne sont pas conservées après l\'analyse.',
    color: 'from-indigo-500 to-blue-500',
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-50/80 to-white dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-semibold mb-4">
              <AudioLines className="w-4 h-4" />
              <span>Fonctionnalités</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Une suite complète d'outils professionnels pour l'analyse audio des dialectes.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FadeIn key={feature.title} delay={idx * 100}>
              <div className="group h-full p-7 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-900/30 hover:border-violet-200 dark:hover:border-violet-700 hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-1 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
