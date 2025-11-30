import React, { useState, useRef } from 'react';

import { SkillSlotConfig } from '../types';
import './SkillSlot.css';

interface SkillSlotProps {
  config: SkillSlotConfig;
  onChange: (config: SkillSlotConfig) => void;
}

export default function SkillSlot({ config, onChange }: SkillSlotProps) {
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault();

    if (e.key === 'Escape') {
      onChange({ ...config, key: '', enabled: false });
      setIsListening(false);
      return;
    }

    const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    // 키를 설정하면 자동으로 활성화
    onChange({ ...config, key, enabled: true });
    setIsListening(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If not listening, Left Click starts listening
    if (!isListening && e.button === 0) {
      startKeyCapture();
      return;
    }

    // If listening (or Right/Middle click), set the key
    let key = '';
    switch (e.button) {
      case 0: key = 'MouseLeft'; break;
      case 1: key = 'MouseMiddle'; break;
      case 2: key = 'MouseRight'; break;
      default: return;
    }

    onChange({ ...config, key, enabled: true });
    setIsListening(false);
  };

  const startKeyCapture = () => {
    setIsListening(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleIntervalChange = (value: string) => {
    if (value === '') {
      onChange({ ...config, interval: 0 });
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onChange({ ...config, interval: Math.max(0, Math.min(5000, numValue)) });
    }
  };

  return (
    <div className={`skill-slot ${config.enabled ? 'enabled' : 'disabled'}`}>
      <div className="slot-header">
        <div className="slot-number">{config.slotNumber}</div>

        <div className="key-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={isListening ? '...' : (config.key || 'EMPTY')}
            onKeyDown={handleKeyCapture}
            onMouseDown={handleMouseDown}
            onContextMenu={(e) => e.preventDefault()}
            onBlur={() => setIsListening(false)}
            readOnly={!isListening}
            className="key-input"
          />
        </div>

        <div className="interval-wrapper">
          <span className="interval-label">INTERVAL (MSEC)</span>
          <input
            type="number"
            className="interval-input-box"
            value={config.interval}
            onChange={(e) => handleIntervalChange(e.target.value)}
            onFocus={(e) => e.target.select()}
            min={0}
            max={5000}
          />
        </div>
      </div>

      <div className="slider-wrapper">
        <input
          type="range"
          min={0}
          max={2000}
          value={config.interval}
          onChange={(e) => onChange({ ...config, interval: parseInt(e.target.value, 10) })}
        />
      </div>
    </div>
  );
}
