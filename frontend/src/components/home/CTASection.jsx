import { Link } from 'react-router-dom';
import { Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import FadeIn from '../ui/FadeIn';

export default function CTASection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-900 dark:via-purple-900 dark:to-pink-900 p-10 md:p-16 text-center shadow-2xl shadow-violet-500/25 dark:shadow-none">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 dark:from-black/10 to-transparent" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Prêt à analyser vos audios ?
              </h2>
              <p className="text-violet-100 mb-10 max-w-2xl mx-auto text-lg">
                Rejoignez les chercheurs et professionnels qui utilisent DialectID pour préserver et étudier la richesse linguistique marocaine.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="group relative flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-400 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-100 dark:via-violet-900/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Mic className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Lancer l'Analyse</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              
              {/* Trust badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-8 text-violet-200 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Gratuit
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Sans inscription
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Données sécurisées
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
