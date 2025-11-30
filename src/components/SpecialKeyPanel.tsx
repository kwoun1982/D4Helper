import React, { useState, useRef } from 'react';
import { SpecialKeyConfig } from '../types';
import './SpecialKeyPanel.css';

interface SpecialKeyPanelProps {
  config: SpecialKeyConfig;
  onChange: (config: SpecialKeyConfig) => void;
}

export default function SpecialKeyPanel({ config, onChange }: SpecialKeyPanelProps) {
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    onChange({ ...config, key, enabled: true });
    setIsListening(false);
  };

  const startKeyCapture = () => {
    setIsListening(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  return (
    <div className="special-key-panel panel-box">
      <h3 className="section-title">SPECIAL KEY (HOLD TO PAUSE)</h3>

      <div className="special-key-row">
        <div className="special-key-label">
          <span className="skull-icon">💀</span> KEY:
        </div>

        <div className="special-key-input-wrapper" onClick={startKeyCapture}>
          <button className={`special-key-btn ${config.enabled ? 'active' : ''}`}>
            {isListening ? 'PRESS ANY KEY...' : (config.key || 'CLICK TO SET')}
          </button>

          {/* Hidden input for capture */}
          <input
            ref={inputRef}
            type="text"
            style={{ opacity: 0, position: 'absolute', pointerEvents: 'none' }}
            onKeyDown={handleKeyCapture}
            onBlur={() => setIsListening(false)}
            readOnly={!isListening}
          />
        </div>
      </div>
    </div>
  );
}
