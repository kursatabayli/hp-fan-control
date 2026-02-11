import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { FanConfig } from "../types";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: FanConfig | null;
  onConfigChange: (newConfig: FanConfig) => void;
  onSave: () => void;
}

export const SettingsModal = ({ isOpen, onClose, config, onSave }: Props) => {
  const [autostartEnabled, setAutostartEnabled] = useState(false);

  useEffect(() => {
    const checkAutostart = async () => {
      const enabled = await isEnabled();
      setAutostartEnabled(enabled);
    };
    if (isOpen) checkAutostart();
  }, [isOpen]);

  const toggleAutostart = async () => {
    try {
      if (autostartEnabled) {
        await disable();
        setAutostartEnabled(false);
      } else {
        await enable();
        setAutostartEnabled(true);
      }
    } catch (e) {
      console.error("Autostart toggle failed", e);
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100 transition-all">
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <h2 className="text-white font-bold text-lg tracking-wide">SETTINGS</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Start with System</p>
              <p className="text-[10px] text-white/40">Launch application on startup</p>
            </div>
            <button
              onClick={toggleAutostart}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative ${autostartEnabled ? 'bg-cyan-500' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-md ${autostartEnabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

        </div>

        <div className="mt-8">
          <button
            onClick={() => { onSave(); onClose(); }}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3 text-xs font-bold tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Check size={14} /> SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};