import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SystemStats } from "./types";
import { StatusIndicator } from "./components/StatusIndicator";
import { FanList } from "./components/FanList";
import { ToggleSwitch } from "./components/ToggleSwitch";
import "./App.css";

function App() {
  const [isMax, setIsMax] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Ready");
  const [stats, setStats] = useState<SystemStats>({ fans: [] });

  const fetchStats = async () => {
    try {
      const data = await invoke<SystemStats>("get_fan_speeds");
      setStats(data);
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    const newMode = !isMax;
    const modeString = newMode ? "max" : "auto";

    setStatusMsg(newMode ? "Activating Max Mode..." : "Switching to Auto...");

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

  return (
    <div className="container">
      <div className="card">
        <h1>HP FAN CONTROL</h1>

        <StatusIndicator isMax={isMax} />

        <FanList fans={stats.fans} />

        <ToggleSwitch isChecked={isMax} onToggle={handleToggle} />

        <p className="log-text">{statusMsg}</p>
      </div>
    </div>
  );
}

export default App;