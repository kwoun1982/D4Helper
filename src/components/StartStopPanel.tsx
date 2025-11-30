import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MacroStatus } from '../types';
import './StartStopPanel.css';

interface StartStopPanelProps {
  status: MacroStatus;
  onStart: () => void;
  onStop: () => void;
  startStopKey: string;
  onKeyChange: (key: string) => void;
}

export default function StartStopPanel({ status, onStart, onStop, startStopKey, onKeyChange }: StartStopPanelProps) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRecording) {
        e.preventDefault();
        e.stopPropagation();

        let keyName = e.key;

        // Function Keys (F1-F12)
        if (/^F\d+$/.test(keyName)) {
          // Keep as is
        }
        // Space
        else if (keyName === ' ' || keyName === 'Spacebar') {
          keyName = 'Space';
        }
        // Special Keys
        else if (keyName === 'Escape') {
          setIsRecording(false);
          return; // Cancel recording
        }
        else if (['Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'].includes(keyName)) {
          keyName = keyName.toUpperCase();
        }
        else if (keyName === 'ArrowUp') keyName = 'UP';
        else if (keyName === 'ArrowDown') keyName = 'DOWN';
        else if (keyName === 'ArrowLeft') keyName = 'LEFT';
        else if (keyName === 'ArrowRight') keyName = 'RIGHT';
        // Single characters (letters/numbers)
        else if (keyName.length === 1) {
          keyName = keyName.toUpperCase();
        }
        // Other keys (Tab, Enter, etc.) - Capitalize first letter
        else {
          keyName = keyName.toUpperCase();
        }

        console.log('Key captured:', keyName);
        onKeyChange(keyName);
        setIsRecording(false);
      }
    };

    if (isRecording) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, onKeyChange]);

  return (
    <div className="start-stop-panel panel-box">
      <h3 className="section-title">START/STOP KEYS</h3>

      <div className="button-group">
        <button
          className={`diablo-btn success ${status.state === 'running' ? 'active' : ''}`}
          onClick={onStart}
          disabled={status.state === 'running'}
        >
          <span>🔥</span> START KEY ({startStopKey})
        </button>

        <button
          className="diablo-btn danger"
          onClick={onStop}
          disabled={status.state === 'stopped'}
        >
          <span>⬛</span> STOP KEY ({startStopKey})
        </button>
      </div>

      <div className="key-setting">
        <span className="key-label">{startStopKey}:</span>
        <button
          className={`key-value ${isRecording ? 'recording' : ''}`}
          onClick={() => setIsRecording(true)}
          disabled={status.state === 'running' || status.state === 'paused'}
        >
          {isRecording ? 'SET' : startStopKey}
        </button>
      </div>

      <div className="status-indicator">
        <span className={`status-dot ${status.state}`}></span>
        <span className={`status-text ${status.state}`}>
          {status.state === 'running' ? t('status.running') : status.state === 'paused' ? t('status.paused') : t('status.stopped')}
        </span>
      </div>
    </div>
  );
}
