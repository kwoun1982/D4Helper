
import './DiabloSlider.css';

interface DiabloSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function DiabloSlider({ value, min, max, onChange }: DiabloSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="diablo-slider-wrapper">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="diablo-slider"
        style={{
          background: `linear-gradient(to right,
            #8b0000 0%,
            #b22222 ${percentage}%,
            #2a1515 ${percentage}%,
            #2a1515 100%)`
        }}
      />
    </div>
  );
}
