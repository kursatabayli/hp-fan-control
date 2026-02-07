import "../App.css";

interface Props {
  isChecked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const ToggleSwitch = ({ isChecked, onToggle, disabled }: Props) => {
  return (
    <div className="control-area">
      <label className="switch">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onToggle}
          disabled={disabled}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};