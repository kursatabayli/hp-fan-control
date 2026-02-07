import { FanSensor } from "../types";
import "../App.css";

interface Props {
  fans: FanSensor[];
}

export const FanList = ({ fans }: Props) => {
  if (!fans || fans.length === 0) {
    return (
      <div className="rpm-container">
        <div className="rpm-box">
          <span className="rpm-label">SYSTEM</span>
          <span className="rpm-value" style={{ fontSize: "0.9rem", color: "#666" }}>
            NO FANS DETECTED
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rpm-container">
      {fans.map((fan, index) => (
        <div key={fan.id} style={{ display: "flex", flex: 1, alignItems: "center" }}>

          <div className="rpm-box">
            <span className="rpm-label">{fan.id.toUpperCase().replace("_", " ")}</span>
            <span className="rpm-value">
              {fan.rpm} <small>RPM</small>
            </span>
          </div>

          {index < fans.length - 1 && <div className="rpm-divider"></div>}

        </div>
      ))}
    </div>
  );
};