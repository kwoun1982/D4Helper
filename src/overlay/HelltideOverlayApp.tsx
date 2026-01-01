import { useState, useEffect, useRef } from 'react';
import './overlay.css';

interface EventTimersData {
    helltide: { status: string; time: string };
    worldBoss: { name: string; time: string };
    legion: { time: string };
}

// Helper: Parse "MM:SS" to total seconds
function parseTimeToSeconds(timeStr: string): number {
    if (!timeStr || timeStr === '--' || timeStr === '--:--') return -1;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return -1;
}

// Helper: Format seconds to "MM:SS"
function formatSecondsToTime(totalSeconds: number): string {
    if (totalSeconds < 0) return '--:--';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

export default function HelltideOverlayApp() {
    const [serverTimers, setServerTimers] = useState<EventTimersData | null>(null);
    const [displayTimers, setDisplayTimers] = useState<{
        helltide: { status: string; time: string };
        worldBoss: { name: string; time: string };
        legion: { time: string };
    } | null>(null);
    const [config, setConfig] = useState<{ helltideEnabled: boolean; worldBossEnabled: boolean; legionEnabled: boolean }>({
        helltideEnabled: true,
        worldBossEnabled: true,
        legionEnabled: true
    });
    const [isInteractive, setIsInteractive] = useState(false);
    const isDraggingRef = useRef(false);
    const lastScreenPos = useRef({ x: 0, y: 0 });
    const btnRef = useRef<HTMLDivElement>(null);
    const isInteractiveRef = useRef(false);

    // Countdown timer - decrease every second
    useEffect(() => {
        if (!serverTimers) return;

        // Initialize display timers from server data
        setDisplayTimers({
            helltide: { ...serverTimers.helltide },
            worldBoss: { ...serverTimers.worldBoss },
            legion: { ...serverTimers.legion }
        });

        // Store seconds for countdown
        let helltideSeconds = parseTimeToSeconds(serverTimers.helltide.time);
        let worldBossSeconds = parseTimeToSeconds(serverTimers.worldBoss.time);
        let legionSeconds = parseTimeToSeconds(serverTimers.legion.time);

        const countdownInterval = setInterval(() => {
            // Decrease each timer by 1 second
            if (helltideSeconds > 0) helltideSeconds--;
            if (worldBossSeconds > 0) worldBossSeconds--;
            if (legionSeconds > 0) legionSeconds--;

            setDisplayTimers({
                helltide: {
                    status: serverTimers.helltide.status,
                    time: formatSecondsToTime(helltideSeconds)
                },
                worldBoss: {
                    name: serverTimers.worldBoss.name,
                    time: formatSecondsToTime(worldBossSeconds)
                },
                legion: {
                    time: formatSecondsToTime(legionSeconds)
                }
            });
        }, 1000);

        return () => clearInterval(countdownInterval);
    }, [serverTimers]);

    // Keep refs in sync with state
    useEffect(() => {
        isInteractiveRef.current = isInteractive;
    }, [isInteractive]);

    useEffect(() => {
        if (!window.electronAPI) {
            console.error("[HELLTIDE-OVERLAY] Electron API not found!");
            return;
        }

        // Helltide updates from server
        if (window.electronAPI.onHelltideUpdate) {
            window.electronAPI.onHelltideUpdate((data: any) => {
                console.log("[HELLTIDE-OVERLAY] Received data:", data);
                setServerTimers(data); // Update server timers, countdown will sync
            });
        }

        // Load initial config
        window.electronAPI.configLoad().then((loadedConfig: any) => {
            setConfig({
                helltideEnabled: loadedConfig.helltideEnabled ?? true,
                worldBossEnabled: loadedConfig.worldBossEnabled ?? true,
                legionEnabled: loadedConfig.legionEnabled ?? true
            });
        });

        // Listen for config changes
        if (window.electronAPI.onHelltideStateChange) {
            window.electronAPI.onHelltideStateChange((state: { feature: string; enabled: boolean }) => {
                setConfig(prev => {
                    const newConfig = { ...prev };
                    if (state.feature === 'helltide') newConfig.helltideEnabled = state.enabled;
                    if (state.feature === 'worldBoss') newConfig.worldBossEnabled = state.enabled;
                    if (state.feature === 'legion') newConfig.legionEnabled = state.enabled;
                    return newConfig;
                });
            });
        }

        // Listen for interactive mode toggle
        if (window.electronAPI.onOverlayInteractive) {
            window.electronAPI.onOverlayInteractive((interactive: boolean) => {
                setIsInteractive(interactive);
            });
        }

        // Dragging logic - using refs to avoid closure issues
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDraggingRef.current && window.electronAPI.moveHelltideOverlay) {
                const deltaX = e.screenX - lastScreenPos.current.x;
                const deltaY = e.screenY - lastScreenPos.current.y;

                if (deltaX !== 0 || deltaY !== 0) {
                    window.electronAPI.moveHelltideOverlay(deltaX, deltaY);
                    lastScreenPos.current = { x: e.screenX, y: e.screenY };
                }
            }
        };

        const handleGlobalMouseUp = (e: MouseEvent) => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                if (btnRef.current && !isInteractiveRef.current && window.electronAPI.setHelltideOverlayFocus) {
                    const rect = btnRef.current.getBoundingClientRect();
                    const isOver =
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom;

                    if (!isOver) {
                        window.electronAPI.setHelltideOverlayFocus(false);
                    }
                }
            }
        };

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, []); // Empty dependency array - register once

    if (!window.electronAPI) {
        return null;
    }

    // If nothing enabled, hide overlay
    if (!config.helltideEnabled && !config.worldBossEnabled && !config.legionEnabled) {
        return null;
    }

    return (
        <div className={`overlay-container ${isInteractive ? 'interactive' : ''}`}>
            <div className="profile-status-list">
                {config.helltideEnabled && (
                    <div className={`profile-item ${displayTimers?.helltide?.status === 'Active' ? 'running' : 'stopped'}`}>
                        <span className="profile-name">지옥물결</span>
                        <span className="profile-state">{displayTimers?.helltide?.time || '--'}</span>
                    </div>
                )}
                {config.worldBossEnabled && (
                    <div className="profile-item paused">
                        <span className="profile-name">
                            {displayTimers?.worldBoss?.name && displayTimers.worldBoss.name !== 'Unknown'
                                ? displayTimers.worldBoss.name
                                : '월드보스'}
                        </span>
                        <span className="profile-state">{displayTimers?.worldBoss?.time || '--'}</span>
                    </div>
                )}
                {config.legionEnabled && (
                    <div className="profile-item legion">
                        <span className="profile-name">군단</span>
                        <span className="profile-state">{displayTimers?.legion?.time || '--'}</span>
                    </div>
                )}
            </div>

            <div
                ref={btnRef}
                className={`layout-toggle-btn ${isInteractive ? 'active' : ''}`}
                onMouseEnter={() => {
                    if (!isInteractive && window.electronAPI.setHelltideOverlayFocus) {
                        window.electronAPI.setHelltideOverlayFocus(true);
                    }
                }}
                onMouseLeave={() => {
                    if (!isDraggingRef.current && !isInteractive && window.electronAPI.setHelltideOverlayFocus) {
                        window.electronAPI.setHelltideOverlayFocus(false);
                    }
                }}
                onMouseDown={(e) => {
                    isDraggingRef.current = true;
                    lastScreenPos.current = { x: e.screenX, y: e.screenY };
                }}
                title="Move Helltide Overlay"
            >
                ✥
            </div>
        </div>
    );
}
