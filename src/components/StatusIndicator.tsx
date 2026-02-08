import { ShieldCheck, Flame } from "lucide-react";

interface Props {
  isMax: boolean;
  themeColor: string;
}

export const StatusIndicator = ({ isMax, themeColor }: Props) => {
  return (
    <div className="flex items-center justify-center gap-3">

      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 border border-white/5 backdrop-blur-md shadow-inner transition-all duration-500 hover:bg-white/5">

        <div className="w-2 h-2 rounded-full animate-pulse transition-colors duration-500"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 0 12px ${themeColor}`
          }}
        />

        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">
          System {isMax ? "Unleashed" : "Optimized"}
        </span>
      </div>

      <div
        className="flex items-center justify-center w-8 h-8 rounded-full border bg-black/20 backdrop-blur-md transition-all duration-500 shadow-lg"
        style={{
          borderColor: `${themeColor}30`,
          color: themeColor,
          boxShadow: `0 0 20px -5px ${themeColor}40`
        }}
      >
        {isMax ? (
          <Flame size={14} fill="currentColor" className="animate-pulse" />
        ) : (
          <ShieldCheck size={14} />
        )}
      </div>

    </div>
  );
};