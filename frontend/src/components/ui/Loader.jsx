import { useState, useEffect } from 'react';

const PHASES = [
  "Detecting dialect...",
  "Analyzing features...",
  "Running inference...",
  "Mapping decision trees...",
];

export default function Loader() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-[#1A1A1A] w-full min-h-[400px]">
      
      {/* Circular Spinner */}
      <div className="relative w-[72px] h-[72px] mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-[#242424]"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 border-r-transparent border-b-transparent border-l-transparent animate-[spin_1s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]"></div>
      </div>

      <h3 className="text-[17px] font-semibold text-white mb-3 tracking-wide">
        Processing audio
      </h3>
      
      <p className="text-[15px] text-gray-400 mb-8 transition-opacity duration-300 min-h-[24px]">
        {PHASES[phaseIndex]}
      </p>

      {/* Pill Dots Animation */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i} 
            className="w-6 h-1.5 rounded-full bg-violet-600 animate-pulse"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: '1s' }}
          />
        ))}
      </div>

    </div>
  );
}