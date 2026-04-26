import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMetrics } from '../../services/api';

export default function HeroSection() {
  const [accuracy, setAccuracy] = useState(null);

  useEffect(() => {
    getMetrics().then(data => {
      if (data?.accuracy) setAccuracy(Math.round(data.accuracy * 100));
    }).catch(() => setAccuracy(95)); // fallback si API non dispo
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 bg-slate-950">
      
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                      bg-indigo-500/10 border border-indigo-500/20
                      text-indigo-400 text-sm font-medium mb-8">
        <span>🎙️</span>
        <span>Classification audio par IA — 5 modèles CNN</span>
      </div>

      {/* Titre principal */}
      <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
        Identifiez chaque
        <span className="text-transparent bg-clip-text
                         bg-gradient-to-r from-indigo-400 to-violet-400">
          {' '}dialecte marocain
        </span>
      </h1>

      {/* Sous-titre */}
      <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
        Darija, Amazigh, Français, Anglais, Arabe — notre pipeline hiérarchique
        de 5 modèles CNN identifie la langue et le dialecte exact en moins d'une seconde.
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/dashboard"
           className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700
                      text-white font-semibold rounded-xl
                      transition-all duration-200 hover:scale-105">
          🚀 Lancer l'Analyse
        </Link>
        <a href="#pipeline"
           className="px-8 py-4 border border-slate-600 hover:border-slate-400
                      text-slate-300 font-semibold rounded-xl
                      transition-all duration-200">
          Voir l'architecture →
        </a>
      </div>

      {/* Stats rapides */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-16 text-center">
        <div>
          <div className="text-3xl font-bold text-white" id="accuracy-stat">
            {accuracy ? `${accuracy}%+` : '95%+'}
          </div>
          <div className="text-slate-400 text-sm mt-1">Précision</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">5</div>
          <div className="text-slate-400 text-sm mt-1">Modèles CNN</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">&lt;1s</div>
          <div className="text-slate-400 text-sm mt-1">Temps d'analyse</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-white">7</div>
          <div className="text-slate-400 text-sm mt-1">Dialectes</div>
        </div>
      </div>

    </section>
  );
}
