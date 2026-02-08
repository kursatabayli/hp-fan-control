import { SystemStats } from "../types";
import { Cpu, Gpu, Fan } from "lucide-react";

interface Props {
  stats: SystemStats;
}

const getLocalColor = (temp: number) => {
  const clamped = Math.max(30, Math.min(90, temp));
  const hue = 120 - ((clamped - 30) * 2);
  return `hsl(${hue}, 90%, 60%)`;
};

const HardwareCard = ({ title, temp, fanSpeed, icon: Icon }: any) => {
  const color = getLocalColor(temp);

  return (
    <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl p-5 transition-all duration-500 hover:bg-white/10">

      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-[50px] opacity-30 transition-colors duration-1000"
        style={{ backgroundColor: color }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10">
            <Icon size={18} className="text-white/70" />
          </div>
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{title}</span>
        </div>

        <div className="flex items-baseline gap-1">
          <span
            className="text-5xl font-black tracking-tighter transition-colors duration-500"
            style={{ color: color, textShadow: `0 0 30px ${color}30` }}
          >
            {temp}
          </span>
          <span className="text-lg text-white/30 font-medium">°C</span>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-1.5 opacity-60">
            <Fan size={14} className={fanSpeed > 0 ? "animate-[spin_2s_linear_infinite]" : ""} />
            <span className="text-[10px] uppercase font-bold">Fan</span>
          </div>
          <span className="font-mono text-sm font-bold text-white/90">{fanSpeed} <span className="text-[10px] text-white/40">RPM</span></span>
        </div>
      </div>
    </div>
  );
};

export const StatsDisplay = ({ stats }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <HardwareCard title="CPU" temp={stats.cpu_temp} fanSpeed={stats.cpu_fan_rpm} icon={Cpu} />
      <HardwareCard title="GPU" temp={stats.gpu_temp} fanSpeed={stats.gpu_fan_rpm} icon={Gpu} />
    </div>
  );
};