import React, { useState } from 'react';
import { AppMode, GeneratedResult, GeneratorSettings } from './types';
import { generateLaserDesign } from './services/geminiService';
import SettingsPanel from './components/SettingsPanel';
import PreviewCanvas from './components/PreviewCanvas';
import { Sparkles, Box, Scissors, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AppMode>(AppMode.TWO_D);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<GeneratorSettings>({
    cutColor: '#FF0000',
    engraveColor: '#000000',
    cutStrokeWidth: 0.1,
    materialThickness: 3.0,
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedData = await generateLaserDesign(prompt, mode, settings);
      setResult(generatedData);
    } catch (err: any) {
      setError(err.message || "Nastala chyba při generování.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-200">
      {/* Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-laser-600 to-laser-900 rounded-lg flex items-center justify-center shadow-lg shadow-laser-900/20">
            <Scissors className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">LaserCraft AI</h1>
            <p className="text-xs text-slate-500 font-mono">SVG GENERATOR v1.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-slate-500 hover:text-slate-300 transition">Powered by Gemini Pro</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar - Controls */}
        <aside className="w-96 flex flex-col border-r border-slate-800 bg-slate-900/50 p-6 gap-6 overflow-y-auto z-10">
          
          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode(AppMode.TWO_D)}
              className={`flex flex-col items-center justify-center py-3 rounded-md transition-all ${mode === AppMode.TWO_D ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <LayoutDashboard size={20} className="mb-1" />
              <span className="text-xs font-semibold">2D Design</span>
            </button>
            <button
              onClick={() => setMode(AppMode.THREE_D_PUZZLE)}
              className={`flex flex-col items-center justify-center py-3 rounded-md transition-all ${mode === AppMode.THREE_D_PUZZLE ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
            >
              <Box size={20} className="mb-1" />
              <span className="text-xs font-semibold">3D Puzzle</span>
            </button>
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              Popis projektu
              <span className="text-xs text-slate-500 font-normal">Buďte detailní</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === AppMode.TWO_D 
                ? "Např.: Ozdobná podtácka ve tvaru mandaly s gravírovaným textem 'Káva' uprostřed..." 
                : "Např.: Malá krabička na šperky s odklápěcím víkem..."}
              className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm focus:border-laser-500 focus:ring-1 focus:ring-laser-500 transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          {/* Settings */}
          <SettingsPanel settings={settings} setSettings={setSettings} />

          {/* Action Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="mt-auto w-full bg-gradient-to-r from-laser-600 to-laser-500 hover:from-laser-500 hover:to-laser-400 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-laser-900/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            {isLoading ? (
               <span className="animate-pulse">Pracuji...</span>
            ) : (
              <>
                <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                Vygenerovat SVG
              </>
            )}
          </button>
          
          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-xs">
              {error}
            </div>
          )}
        </aside>

        {/* Right Area - Preview */}
        <section className="flex-1 p-6 bg-slate-950 overflow-hidden">
          <PreviewCanvas result={result} isLoading={isLoading} />
        </section>

      </main>
    </div>
  );
};

export default App;