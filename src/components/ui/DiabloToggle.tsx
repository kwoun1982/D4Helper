
import './DiabloToggle.css';

interface DiabloToggleProps {
  checked: boolean;
  onChange: () => void;
}

export default function DiabloToggle({ checked, onChange }: DiabloToggleProps) {
  return (
    <button
      className={`diablo-toggle ${checked ? 'active' : ''}`}
      onClick={onChange}
      type="button"
      aria-label="Toggle"
    >
      <span className="toggle-indicator" />
    </button>
  );
}
