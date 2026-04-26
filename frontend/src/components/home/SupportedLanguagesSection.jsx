import { Languages } from 'lucide-react';
import FadeIn from '../ui/FadeIn';

const supportedLanguages = [
  { name: 'Darija', variants: ['Chamaliya', 'Dakhil', 'Hassania'], flag: '🇲🇦', color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50' },
  { name: 'Amazigh', variants: ['Souss', 'Atlas', 'Rif'], flag: 'ⵣ', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50' },
  { name: 'Arabe Standard', variants: ['Classique'], flag: '🇸🇦', color: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' },
  { name: 'Français', variants: ['Standard'], flag: '🇫🇷', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50' },
  { name: 'Anglais', variants: ['Standard'], flag: '🇬🇧', color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' },
];

export default function SupportedLanguagesSection() {
  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-semibold mb-4">
              <Languages className="w-4 h-4" />
              <span>Langues Supportées</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Un Pipeline Multi-Langues
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Notre système détecte et classe avec une précision exceptionnelle tous les dialectes marocains et langues standards.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {supportedLanguages.map((lang, idx) => (
            <FadeIn key={lang.name} delay={idx * 100}>
              <div className="group relative p-6 rounded-2xl bg-gray-50/80 dark:bg-slate-900/80 border border-gray-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-default">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5 dark:from-violet-500/10 dark:to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{lang.flag}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{lang.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {lang.variants.map((variant) => (
                      <span
                        key={variant}
                        className={`text-xs px-2.5 py-1 rounded-full border ${lang.color} font-medium`}
                      >
                        {variant}
                      </span>
                    ))}
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
