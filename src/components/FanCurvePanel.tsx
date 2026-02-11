import { FanConfig, CurvePoint, SystemStats } from "../types";
import { CurveEditor } from "./CurveEditor";
import { Save, Sliders, Lock, RotateCcw, RefreshCw } from "lucide-react";

interface Props {
  stats: SystemStats;
  config: FanConfig | null;
  isManual: boolean;
  hasChanges: boolean;
  onConfigChange: (newConfig: FanConfig) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRestore: () => void;
}

export const FanCurvePanel = ({
  stats, config, isManual, hasChanges,
  onConfigChange, onSave, onDiscard, onRestore
}: Props) => {
  if (!config) return null;

  const handleCpuChange = (newPoints: CurvePoint[]) => {
    onConfigChange({ ...config, cpuCurve: newPoints });
  };

  const handleGpuChange = (newPoints: CurvePoint[]) => {
    onConfigChange({ ...config, gpuCurve: newPoints });
  };

  return (
    <div
      className={`
        relative w-full transition-all duration-700 ease-in-out border border-white/5 rounded-4xl overflow-hidden
        ${isManual ? 'opacity-100 bg-black/40 shadow-2xl translate-y-0' : 'opacity-50 grayscale bg-black/20 translate-y-4 pointer-events-none'}
      `}
      style={{
        maxHeight: isManual ? '1200px' : '80px',
      }}
    >

      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isManual ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/20'}`}>
            {isManual ? <Sliders size={18} /> : <Lock size={18} />}
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider text-white">FAN CURVE CONTROL</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">

          <div className={`transition-all duration-300 ${hasChanges ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
            <button
              onClick={onDiscard}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-bold transition-all"
            >
              <RotateCcw size={14} />
              DISCARD
            </button>
          </div>

          <div className={`transition-all duration-500 ${hasChanges ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <button
              onClick={onSave}
              className="cursor-pointer flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500 text-black text-xs font-black hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >
              <Save size={14} strokeWidth={3} />
              SAVE
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <CurveEditor title="CPU FAN CURVE" color="#22d3ee" points={config.cpuCurve} currentTemp={stats.cpuTemp} onChange={handleCpuChange} />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative">
              <CurveEditor title="GPU FAN CURVE" color="#a78bfa" points={config.gpuCurve} currentTemp={stats.gpuTemp} onChange={handleGpuChange} />
            </div>
          </div>
        </div>

        {isManual && (
          <div className="flex justify-start border-t border-white/5 pt-6">
            <button
              onClick={onRestore}
              className="cursor-pointer flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/20 hover:text-white/60 transition-colors uppercase group"
            >
              <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
              Restore to Defaults
            </button>
          </div>
        )}

        {!isManual && (
          <div className="absolute inset-0 top-20 bg-linear-to-b from-transparent to-black/80 flex items-end justify-center pb-8 backdrop-blur-[2px]">
            <span className="text-white/30 text-xs font-mono tracking-widest bg-black/50 px-4 py-2 rounded-full border border-white/10">
              SWITCH TO MANUAL MODE TO EDIT CURVES
            </span>
          </div>
        )}
      </div>

    </div>
  );
};