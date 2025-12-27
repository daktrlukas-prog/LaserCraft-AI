import React from 'react';
import { GeneratorSettings } from '../types';
import { Settings, Sliders } from 'lucide-react';

interface SettingsPanelProps {
  settings: GeneratorSettings;
  setSettings: React.Dispatch<React.SetStateAction<GeneratorSettings>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings }) => {
  const handleChange = (key: keyof GeneratorSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
      <div className="flex items-center gap-2 text-laser-500 font-semibold border-b border-slate-700 pb-2">
        <Settings size={20} />
        <h2>Nastavení Laseru</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colors */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Barva Řezu (Cut)</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={settings.cutColor}
              onChange={(e) => handleChange('cutColor', e.target.value)}
              className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
            />
            <span className="text-sm font-mono text-slate-300">{settings.cutColor}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Barva Gravíru (Engrave)</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={settings.engraveColor}
              onChange={(e) => handleChange('engraveColor', e.target.value)}
              className="h-8 w-8 rounded cursor-pointer bg-transparent border-none"
            />
             <span className="text-sm font-mono text-slate-300">{settings.engraveColor}</span>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tloušťka čáry řezu (mm)</label>
          <input 
            type="number" 
            step="0.01"
            min="0.01"
            value={settings.cutStrokeWidth}
            onChange={(e) => handleChange('cutStrokeWidth', parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-laser-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
             Tloušťka Materiálu (mm)
             <span className="text-[10px] bg-laser-900 text-laser-100 px-1 rounded">Pro 3D</span>
          </label>
          <input 
            type="number" 
            step="0.1"
            min="0.1"
            value={settings.materialThickness}
            onChange={(e) => handleChange('materialThickness', parseFloat(e.target.value))}
            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-laser-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;