import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats, FanConfig, DEFAULT_CURVE_POINTS } from "./types";
import { StatsDisplay } from "./components/StatsDisplay";
import { FanCurvePanel } from "./components/FanCurvePanel";
import { BackgroundEffects } from "./components/BackgroundEffects";
import { StatusHeader } from "./components/StatusHeader";
import { ModeSelector } from "./components/ModeSelector";
import { SettingsModal } from "./components/SettingsModal";
import "./App.css";

function App() {
  const [mode, setMode] = useState<string>("auto");
  const [config, setConfig] = useState<FanConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    cpuTemp: 0,
    gpuTemp: 0,
    cpuFanRpm: 0,
    gpuFanRpm: 0
  });

  const fetchStats = async () => {
    try {
      const data = await invoke<SystemStats>("get_system_stats");
      setStats(data);
    } catch (error) {
      console.error("Stats error:", error);
    }
  };

  const fetchConfig = async () => {
    try {
      const cfg = await invoke<FanConfig>("get_config");
      setConfig(cfg);

      if (cfg && cfg.lastMode) {
        setMode(cfg.lastMode);
      }
    } catch (error) {
      console.error("Config error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchConfig();
    const interval = setInterval(fetchStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = async (newMode: string) => {
    if (mode === newMode) return;
    setMode(newMode);
    (`Switching to ${newMode.toUpperCase()} mode...`);

    try {
      await invoke<string>("set_fan_mode", { mode: newMode });
    } catch (error) {
      console.error("Mode error:", error);
    }
  };

  const handleDiscardChanges = () => {
    fetchConfig(); // Backend'den tekrar oku
    setHasChanges(false);
  };

  // YENİ: Varsayılan ayarlara dön
  const handleRestoreDefaults = () => {
    if (!config) return;

    setConfig({
      ...config,
      cpuCurve: [...DEFAULT_CURVE_POINTS], // Kopyalayarak ata
      gpuCurve: [...DEFAULT_CURVE_POINTS]
    });

    setHasChanges(true); // Değişiklik var, kaydetmesi gerekebilir
  };

  const handleConfigChange = (newConfig: FanConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      await invoke("save_config", { config });
      setHasChanges(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const getThemeColor = () => {
    switch (mode) {
      case "manual": return "#22d3ee";
      case "max": return "#ef4444";
      case "auto": return "#10b981";
      default: return "#10b981";
    }
  };

  const currentThemeColor = getThemeColor();

  return (
    <div className="relative min-h-screen flex flex-col items-center py-12 px-4 bg-background overflow-x-hidden selection:bg-cyan-500/30">

      <BackgroundEffects themeColor={currentThemeColor} />

      <div className="w-full max-w-3xl relative z-10 space-y-6">

        <div
          className="bg-black/40 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-4xl p-8 ring-1 ring-white/5 transition-all duration-700"
          style={{ boxShadow: `0 20px 60px -20px ${currentThemeColor}15` }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">

            <StatusHeader
              themeColor={currentThemeColor}
            />

            <ModeSelector
              currentMode={mode}
              onModeChange={handleModeChange}
              onSettingsClick={() => setIsSettingsOpen(true)}
            />

          </div>

          <StatsDisplay stats={stats} />
        </div>

        <FanCurvePanel
          stats={stats}
          config={config}
          isManual={mode === "manual"}
          hasChanges={hasChanges}
          onConfigChange={handleConfigChange}
          onSave={saveConfig}
          onDiscard={handleDiscardChanges}
          onRestore={handleRestoreDefaults}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onConfigChange={handleConfigChange}
          onSave={saveConfig}
        />
      </div>
    </div>
  );
}

export default App;