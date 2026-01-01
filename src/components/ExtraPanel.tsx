import './ExtraPanel.css';

interface ExtraPanelProps {
    overlayEnabled: boolean;
    onToggleOverlay: (enabled: boolean) => void;
    helltideEnabled: boolean;
    worldBossEnabled: boolean;
    legionEnabled: boolean;
    onToggleFeature: (feature: 'helltide' | 'worldBoss' | 'legion', enabled: boolean) => void;
}

export default function ExtraPanel({
    overlayEnabled,
    onToggleOverlay,
    helltideEnabled,
    worldBossEnabled,
    legionEnabled,
    onToggleFeature
}: ExtraPanelProps) {
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

                <div className="extra-row">
                    <div className="extra-left">
                        <span className="extra-icon">🔥</span>
                        <span className="extra-name">지옥물결</span>
                    </div>
                    <label className="diablo-toggle">
                        <input
                            type="checkbox"
                            checked={helltideEnabled}
                            onChange={() => onToggleFeature('helltide', !helltideEnabled)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="extra-row">
                    <div className="extra-left">
                        <span className="extra-icon">☠️</span>
                        <span className="extra-name">월드보스</span>
                    </div>
                    <label className="diablo-toggle">
                        <input
                            type="checkbox"
                            checked={worldBossEnabled}
                            onChange={() => onToggleFeature('worldBoss', !worldBossEnabled)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="extra-row">
                    <div className="extra-left">
                        <span className="extra-icon">⚔️</span>
                        <span className="extra-name">군단이벤트</span>
                    </div>
                    <label className="diablo-toggle">
                        <input
                            type="checkbox"
                            checked={legionEnabled}
                            onChange={() => onToggleFeature('legion', !legionEnabled)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );
}
