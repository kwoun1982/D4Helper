import React, { useState, useRef } from 'react';

import { SkillSlotConfig, MAX_INTERVAL, SLIDER_MAX_INTERVAL } from '../types';
import './SkillSlot.css';

interface SkillSlotProps {
  config: SkillSlotConfig;
  onChange: (config: SkillSlotConfig) => void;
}

export default function SkillSlot({ config, onChange }: SkillSlotProps) {
  const [isListening, setIsListening] = useState(false);
  const [intervalInput, setIntervalInput] = useState(config.interval.toString());
  const [previousInterval, setPreviousInterval] = useState(config.interval);
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

  const handleIntervalFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // 포커스 시 이전 값 저장 및 전체 선택
    setPreviousInterval(config.interval);
    e.target.select();
  };

  const handleIntervalChange = (value: string) => {
    // 실시간으로 입력값 저장 (유효성 검사는 blur 시)
    setIntervalInput(value);
  };

  const handleIntervalBlur = () => {
    // 블러 시 유효성 검사
    const numValue = parseInt(intervalInput, 10);

    if (isNaN(numValue) || numValue < 0 || numValue > MAX_INTERVAL || intervalInput.trim() === '') {
      // 무효한 값: 이전 값으로 복원
      setIntervalInput(previousInterval.toString());
      onChange({ ...config, interval: previousInterval });
    } else {
      // 유효한 값: 저장
      setIntervalInput(numValue.toString());
      onChange({ ...config, interval: numValue });
    }
  };

  const handleSliderChange = (value: number) => {
    onChange({ ...config, interval: value });
    setIntervalInput(value.toString());
    setPreviousInterval(value);
  };

  // config.interval이 외부에서 변경되면 입력값 동기화
  React.useEffect(() => {
    setIntervalInput(config.interval.toString());
  }, [config.interval]);

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
            value={intervalInput}
            onChange={(e) => {
              console.log('Interval input onChange fired, value:', e.target.value);
              handleIntervalChange(e.target.value);
            }}
            onFocus={handleIntervalFocus}
            onBlur={handleIntervalBlur}
            min={0}
            max={MAX_INTERVAL}
          />
        </div>
      </div>

      <div className="slider-wrapper">
        <input
          type="range"
          min={0}
          max={SLIDER_MAX_INTERVAL}
          value={Math.min(config.interval, SLIDER_MAX_INTERVAL)}
          onChange={(e) => {
            console.log('Slider onChange fired, value:', e.target.value);
            handleSliderChange(parseInt(e.target.value, 10));
          }}
        />
      </div>
    </div>
  );
}
