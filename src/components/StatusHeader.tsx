interface Props {
  // statusMsg sildik
  themeColor: string;
}

export const StatusHeader = ({ themeColor }: Props) => {
  return (
    <div className="text-center md:text-left">
      <h1 className="text-3xl font-black text-white tracking-tighter flex items-center justify-center md:justify-start gap-3">
        HP<span className="opacity-50 font-thin">CONTROL</span>
      </h1>

      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
        />
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">
          THERMAL DASHBOARD
        </p>
      </div>
    </div>
  );
};