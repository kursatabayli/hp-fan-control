import { Zap, Leaf, Sliders, Settings } from "lucide-react"; // Settings ikonu eklendi

interface Props {
  currentMode: string;
  onModeChange: (mode: string) => void;
  onSettingsClick: () => void; // YENİ PROP
}

export const ModeSelector = ({ currentMode, onModeChange, onSettingsClick }: Props) => {
  const modes = [
    { id: "auto", icon: Leaf, label: "AUTO", color: "text-green-400" },
    { id: "manual", icon: Sliders, label: "MANUAL", color: "text-cyan-400" },
    { id: "max", icon: Zap, label: "TURBO", color: "text-red-400" }
  ];

  return (
    <div className="bg-white/5 p-1.5 rounded-2xl flex items-center gap-1 border border-white/5">

      {/* MODE BUTONLARI */}
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={`
            px-4 py-2 rounded-xl text-xs font-bold tracking-wider flex items-center gap-2 transition-all duration-300
            ${currentMode === m.id
              ? `bg-white/10 text-white shadow-lg scale-100 ${m.color}`
              : "text-white/40 hover:text-white hover:bg-white/5 scale-95 hover:scale-100 cursor-pointer"}
          `}
        >
          <m.icon size={14} />
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}

      {/* DİKEY AYIRICI ÇİZGİ */}
      <div className="w-px h-6 bg-white/10 mx-1"></div>

      {/* SETTINGS BUTONU (EN SAĞDA) */}
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-500 active:scale-90 cursor-pointer"
        title="Settings"
      >
        <Settings size={18} />
      </button>

    </div>
  );
};