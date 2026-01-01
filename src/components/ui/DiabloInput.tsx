
import './DiabloInput.css';

interface DiabloInputProps {
  type?: 'text' | 'number';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function DiabloInput({
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  readOnly = false,
  className = '',
  style,
}: DiabloInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      readOnly={readOnly}
      className={`diablo-input ${className}`}
      style={style}
    />
  );
}
