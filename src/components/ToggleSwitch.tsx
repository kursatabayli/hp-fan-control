import { Zap, Leaf } from "lucide-react";

interface Props {
  isChecked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  themeColor: string;
}

export const ToggleSwitch = ({ isChecked, onToggle, disabled, themeColor }: Props) => {
  return (
    <div className="relative w-full h-14 bg-black/40 rounded-full p-1.5 backdrop-blur-md border border-white/5 overflow-hidden">

      <div
        className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg ${isChecked ? "translate-x-full left-1.5" : "translate-x-0 left-1.5"
          }`}
        style={{
          backgroundColor: themeColor,
          boxShadow: `0 0 20px ${themeColor}60`
        }}
      />

      <div className="relative h-full flex z-10">

        <button
          onClick={() => isChecked && onToggle()}
          disabled={disabled}
          className={`flex-1 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-full transition-colors duration-300 ${!isChecked
              ? "text-black font-extrabold"
              : "text-white/40 hover:text-white/60"
            }`}
        >
          <Leaf size={16} strokeWidth={3} /> 
          <span className="text-sm tracking-wider font-bold">AUTO</span>
        </button>

        <button
          onClick={() => !isChecked && onToggle()}
          disabled={disabled}
          className={`flex-1 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-full transition-colors duration-300 ${isChecked
              ? "text-black font-extrabold"
              : "text-white/40 hover:text-white/60"
            }`}
        >
          <Zap size={16} strokeWidth={3} fill="currentColor" />
          <span className="text-sm tracking-wider font-bold">MAX</span>
        </button>

      </div>
    </div>
  );
};