export default function ResultCard({ decisionFinale, confiance, audioValide }) {
  const pct = Math.round((confiance || 0) * 100);
  
  return (
    <div className="w-full max-w-sm rounded-[24px] bg-[#242424] border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
      <p className="text-[11px] font-bold text-gray-400 tracking-[0.15em] uppercase mb-4">
        Detected Language
      </p>

      <h2 className="text-[32px] md:text-4xl font-bold text-white mb-10 leading-tight tracking-tight">
        {decisionFinale}
      </h2>

      <div className="flex flex-col gap-2 relative">
         <div className="flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-violet-600 rounded-full transition-all duration-1000 ease-out" 
                 style={{ width: `${Math.max(pct, 5)}%` }} 
               />
            </div>
            <span className="text-sm font-semibold text-gray-400">{pct}%</span>
         </div>
      </div>
    </div>
  );
}