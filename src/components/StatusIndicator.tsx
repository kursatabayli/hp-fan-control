import "../App.css";

interface Props {
  isMax: boolean;
}

export const StatusIndicator = ({ isMax }: Props) => {
  return (
    <div className="status-display">
      <p className="label">CURRENT MODE</p>
      <p className={`value ${isMax ? "neon-red" : "neon-blue"}`}>
        {isMax ? "MAX PERFORMANCE" : "AUTOMATIC"}
      </p>
    </div>
  );
};