import './HelltidePanel.css';
import { EventTimersData } from '../types';

interface HelltidePanelProps {
    data: EventTimersData;
    config: {
        helltideEnabled: boolean;
        worldBossEnabled: boolean;
        legionEnabled: boolean;
    };
}

export default function HelltidePanel({ data, config }: HelltidePanelProps) {
    if (!config.helltideEnabled && !config.worldBossEnabled && !config.legionEnabled) {
        return null;
    }

    return (
        <div className="helltide-panel-container">
            {config.helltideEnabled && (
                <div className="helltide-card helltide">
                    <div className="card-header">HELLTIDE</div>
                    <div className="card-content">
                        <div className={`status ${data.helltide.status === 'Active' ? 'active' : ''}`}>
                            {data.helltide.status}
                        </div>
                        <div className="timer">{data.helltide.time}</div>
                    </div>
                </div>
            )}

            {config.worldBossEnabled && (
                <div className="helltide-card world-boss">
                    <div className="card-header">WORLD BOSS</div>
                    <div className="card-content">
                        <div className="boss-name">{data.worldBoss.name}</div>
                        <div className="timer">{data.worldBoss.time}</div>
                    </div>
                </div>
            )}

            {config.legionEnabled && (
                <div className="helltide-card legion">
                    <div className="card-header">LEGION</div>
                    <div className="card-content">
                        <div className="event-name">Upcoming Event</div>
                        <div className="timer">{data.legion.time}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
