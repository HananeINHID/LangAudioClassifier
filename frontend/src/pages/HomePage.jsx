export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO ─────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8
                          rounded-full bg-indigo-50 border border-indigo-200
                          text-indigo-600 text-sm font-medium">
            🎙️ Pipeline ML — 5 modèles CNN
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900
                         mb-6 leading-tight">
            Détection de
            <span className="text-indigo-600"> langue et dialecte</span>
          </h1>

          <p className="text-slate-500 text-xl max-w-2xl mx-auto mb-10">
            Darija, Amazigh, Français, Anglais, Arabe —
            notre pipeline hiérarchique identifie la langue
            et le dialecte exact en moins d'une seconde.
          </p>

          <a href="/dashboard"
             className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-700
                        text-white font-semibold rounded-xl
                        transition-all duration-200 shadow-lg
                        shadow-indigo-200 hover:shadow-indigo-300">
            🚀 Lancer l'Analyse
          </a>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { valeur: '5',   label: 'Modèles CNN'     },
              { valeur: '7',   label: 'Dialectes'       },
              { valeur: '<1s', label: "Temps d'analyse" },
              { valeur: '97%', label: 'Précision M1'    },
            ].map(({ valeur, label }) => (
              <div key={label}
                   className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-3xl font-bold text-indigo-600 mb-1">{valeur}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ─────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Architecture du Pipeline
          </h2>
          <p className="text-slate-500">3 niveaux de classification en cascade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '1', couleur: 'indigo',
              titre: 'Routeur',
              desc: 'Détecte si l\'audio est Local, Standard ou Bruit',
              classes: ['Local', 'Standard', 'Bruit'],
            },
            {
              num: '2', couleur: 'violet',
              titre: 'Famille',
              desc: 'Identifie la famille dialectale ou la langue',
              classes: ['Darija', 'Amazigh', 'FR/EN/AR'],
            },
            {
              num: '3', couleur: 'purple',
              titre: 'Dialecte',
              desc: 'Précise le sous-dialecte exact',
              classes: ['Chamaliya', 'Dakhil', 'Hassania', 'Souss', 'Atlas', 'Rif'],
            },
          ].map(({ num, titre, desc, classes, couleur }) => (
             <div key={num}
                 className="p-6 bg-white rounded-2xl border border-slate-200
                            shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-${couleur}-100
                              flex items-center justify-center mb-4`}>
                <span className={`text-${couleur}-600 font-bold`}>{num}</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{titre}</h3>
              <p className="text-slate-500 text-sm mb-4">{desc}</p>
              <div className="flex flex-wrap gap-2">
                {classes.map(c => (
                  <span key={c}
                        className="px-3 py-1 bg-slate-100 rounded-lg
                                   text-slate-600 text-xs font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="p-12 bg-indigo-600 rounded-3xl text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Prêt à analyser vos audios ?
          </h2>
          <p className="text-indigo-200 mb-8">
            Vos données audio ne sont pas conservées après l'analyse.
          </p>
          <a href="/dashboard"
             className="inline-block px-8 py-4 bg-white text-indigo-600
                        font-semibold rounded-xl hover:bg-indigo-50
                        transition-all duration-200">
            Commencer l'analyse →
          </a>
        </div>
      </section>

    </div>
  );
}