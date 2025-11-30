
import { useTranslation } from 'react-i18next';
import { StopKeysConfig, STOP_KEY_MAPPING } from '../types';
import './StopKeysPanel.css';

interface StopKeysPanelProps {
  config: StopKeysConfig;
  onChange: (config: StopKeysConfig) => void;
}

const STOP_KEY_ICONS: Record<keyof StopKeysConfig, string> = {
  inventory: '🎒',
  skills: '✕',
  follower: '👤',
  map: '🗺️',
  worldMap: '🌍',
  townPortal: '🌀',
  chat: '💬',
  whisper: '💬',
};

export default function StopKeysPanel({ config, onChange }: StopKeysPanelProps) {
  const { t } = useTranslation();

  const handleToggle = (key: keyof StopKeysConfig) => {
    onChange({ ...config, [key]: !config[key] });
  };

  return (
    <div className="stop-keys-panel panel-box">
      <h3 className="section-title">STOP KEYS</h3>
      <p className="panel-subtitle">(MATCH DIABLO KEYS)</p>

      <div className="stop-keys-list">
        {(Object.keys(config) as Array<keyof StopKeysConfig>).map((key) => (
          <div key={key} className="stop-key-row">
            <div className="stop-key-left">
              <span className="stop-key-icon">{STOP_KEY_ICONS[key]}</span>
              <span className="stop-key-name">
                {t(`stopKeys.${key}`)} ({STOP_KEY_MAPPING[key]})
              </span>
            </div>

            <label className="diablo-toggle">
              <input
                type="checkbox"
                checked={config[key]}
                onChange={() => handleToggle(key)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
