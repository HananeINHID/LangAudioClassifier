import { Mic } from "lucide-react";
import AudioAnalyzer from "../components/AudioAnalyzer";

export default function AnalyzerPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 mb-6">
            <Mic className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analyse Audio
          </h1>
          <p className="text-gray-500">
            Enregistrez ou importez un audio pour le classifier
          </p>
        </div>

        {/* Component */}
        <AudioAnalyzer />

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          Connecté à FastAPI http://127.0.0.1:8000/predict
        </p>
      </div>
    </div>
  );
}
