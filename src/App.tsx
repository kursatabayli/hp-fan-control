import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats } from "./types";
import { StatusIndicator } from "./components/StatusIndicator";
import { StatsDisplay } from "./components/StatsDisplay";
import { ToggleSwitch } from "./components/ToggleSwitch";
import "./App.css";

function App() {
  const [isMax, setIsMax] = useState(false);
  const [statusMsg, setStatusMsg] = useState("System Ready");

  const [stats, setStats] = useState<SystemStats>({
    cpu_temp: 45,
    gpu_temp: 40,
    cpu_fan_rpm: 0,
    gpu_fan_rpm: 0
  });

  const fetchStats = async () => {
    try {
      const data = await invoke<SystemStats>("get_system_stats");
      setStats(data);
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    const newMode = !isMax;
    const modeString = newMode ? "max" : "auto";
    setStatusMsg(newMode ? "Activating Turbo Mode..." : "Optimizing Acoustics...");
    try {
      const response = await invoke("set_fan_mode", { mode: modeString });
      setIsMax(newMode);
      setStatusMsg(response as string);
      setTimeout(fetchStats, 500);
      setTimeout(fetchStats, 1500);
    } catch (error) {
      console.error("Toggle error:", error);
      setStatusMsg(`Error: ${error}`);
    }
  };

  const maxTemp = Math.max(stats.cpu_temp, stats.gpu_temp);

  const getThemeColor = (temp: number) => {
    const clamped = Math.max(30, Math.min(90, temp));
    const hue = 120 - ((clamped - 30) * 2);
    return `hsl(${hue}, 90%, 60%)`;
  };

  const currentThemeColor = getThemeColor(maxTemp);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#050505] overflow-hidden">

      <div
        className="absolute top-[-20%] left-[-10%] w-125 h-125 rounded-full blur-[150px] opacity-20 transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: currentThemeColor }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-100 h-100 rounded-full blur-[120px] opacity-15 transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: currentThemeColor }}
      />

      <div className="w-full max-w-sm relative z-10">

        <div
          className="bg-black/40 backdrop-blur-3xl border border-white/5 shadow-2xl rounded-[40px] p-8 ring-1 ring-white/5 transition-all duration-1000"
          style={{ boxShadow: `0 20px 60px -20px ${currentThemeColor}20` }}
        >

          <div className="flex flex-col items-center mb-8 text-center">
            <div className="mb-4 transform scale-110">
              <StatusIndicator isMax={isMax} themeColor={currentThemeColor} />
            </div>

            <h1 className="text-4xl font-black text-white tracking-tighter mb-1">
              HP<span className="opacity-50 font-thin">CONTROL</span>
            </h1>
            <p
              className="text-[10px] font-bold tracking-[0.3em] uppercase transition-colors duration-500"
              style={{ color: currentThemeColor }}
            >
              Thermal Dashboard
            </p>
          </div>

          <div className="mb-8">
            <StatsDisplay stats={stats} />
          </div>

          <div className="flex flex-col gap-4">
            <ToggleSwitch
              isChecked={isMax}
              onToggle={handleToggle}
              themeColor={currentThemeColor}
            />

            <div className="text-center mt-2">
              <p className="text-[10px] font-mono text-white/30 truncate">
                {">"} {statusMsg}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;