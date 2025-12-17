
import './TitleBar.css';

interface TitleBarProps {
  currentFile?: string;
}

export default function TitleBar({ }: TitleBarProps) {
  const handleMinimize = () => {
    window.electronAPI.windowMinimize();
  };

  const handleClose = () => {
    window.electronAPI.windowClose();
  };

  return (
    <div className="title-bar">
      <div className="title-bar-left">
        <span className="app-icon">⚔</span>
        <span className="app-name">D4HELPER v2.0.3</span>
      </div>

      <div className="title-bar-center">
        <span className="decoration">❖ ❖ ❖ ❖ ❖</span>
        <span className="app-title">DIABLO 4 HELPER - SANCTUARY EDITION</span>
        <span className="decoration">❖ ❖ ❖ ❖ ❖</span>
      </div>

      <div className="title-bar-right">
        <button className="title-bar-btn minimize" onClick={handleMinimize}>
          _
        </button>
        <button className="title-bar-btn close" onClick={handleClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
