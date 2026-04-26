import { Award, CheckCircle2, FileAudio, Clock } from 'lucide-react';
import FadeIn from '../ui/FadeIn';

const whyChooseUs = [
  { icon: FileAudio, title: 'Précision Exceptionnelle', desc: '95%+ de précision sur les dialectes marocains grâce à nos modèles entraînés sur des milliers d\'échantillons.' },
  { icon: Clock, title: 'Analyse en Temps Réel', desc: 'Résultats instantanés en moins d\'une seconde, sans compromis sur la qualité.' },
  { icon: Award, title: 'Reconnaissance Scientifique', desc: 'Méthodologie validée par des linguistes et chercheurs en traitement du signal.' },
];

export default function WhyUsSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-950 dark:to-slate-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              <span>Pourquoi DialectID ?</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              La référence de la classification dialectale
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Des années de recherche et développement pour offrir la solution la plus précise du marché.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {whyChooseUs.map((item, idx) => (
            <FadeIn key={item.title} delay={idx * 150}>
              <div className="group relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-lg shadow-gray-200/30 dark:shadow-none hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-900/20 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                  <div className="mt-5 flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validé par des experts</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
