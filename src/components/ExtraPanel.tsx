import './ExtraPanel.css';

interface ExtraPanelProps {
    overlayEnabled: boolean;
    onToggleOverlay: (enabled: boolean) => void;
}

export default function ExtraPanel({ overlayEnabled, onToggleOverlay }: ExtraPanelProps) {
    return (
        <div className="extra-panel panel-box">
            <h3 className="section-title">EXTRA</h3>
            <div className="extra-content">
                <div className="extra-row">
                    <div className="extra-left">
                        <span className="extra-icon">🎮</span>
                        <span className="extra-name">레이아웃</span>
                    </div>
                    <label className="diablo-toggle">
                        <input
                            type="checkbox"
                            checked={overlayEnabled}
                            onChange={() => onToggleOverlay(!overlayEnabled)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );
}
