import { Check } from "lucide-react";

export default function PipelineStepper({ steps, activeStep }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="w-full max-w-sm flex flex-col pt-4">
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isPending = index > activeStep;
        const isLast = index === steps.length - 1;
        
        const confidence = typeof step.confiance === 'number' 
          ? Math.round(step.confiance * 100) 
          : step.confiance;

        return (
          <div key={index} className="flex relative items-start gap-6">
            {/* Left Timeline */}
            <div className="flex flex-col items-center mt-0.5">
              <div 
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                  isCompleted 
                    ? "bg-violet-100 text-violet-700" 
                    : isActive 
                      ? "bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]" 
                      : "bg-[#1A1A1A] border border-gray-600 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              
              {!isLast && (
                <div className={`w-[2px] h-11 my-1.5 ${isCompleted ? 'bg-gray-700' : 'bg-gray-800'}`} />
              )}
            </div>

            {/* Right Content */}
            <div className={`flex flex-col w-full pb-5 ${!isPending ? 'opacity-100' : 'opacity-40'} transition-opacity`}>
               <div className="flex items-center justify-between mb-1">
                 <p className="text-[13px] font-medium text-gray-400">
                   {step.modele || "Model"}
                 </p>
                 {!isPending && confidence !== undefined && (
                   <span className="text-[13px] font-medium text-violet-400">{confidence}%</span>
                 )}
               </div>
               <p className={`text-[16px] font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>
                 {step.prediction || "..."}
               </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}