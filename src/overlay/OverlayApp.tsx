import { useState, useEffect, useRef } from 'react';
import './overlay.css';

interface ProfileStatus {
    profileName: string;
    startStopKey: string;
    state: 'running' | 'paused' | 'stopped';
}



export default function OverlayApp() {
    const [profiles, setProfiles] = useState<ProfileStatus[]>([]);
    const [isInteractive, setIsInteractive] = useState(false);
    // const [isHoveringBtn, setIsHoveringBtn] = useState(false); // Unused
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const lastScreenPos = useRef({ x: 0, y: 0 }); // Track screen position for dragging
    const btnRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleUpdate = (updatedProfiles: ProfileStatus[]) => {
            console.log('[OVERLAY] Received profiles update:', updatedProfiles);
            setProfiles(updatedProfiles);
        };

        window.electronAPI.onOverlayUpdate(handleUpdate);



        // Listen for interactive mode toggle
        if (window.electronAPI.onOverlayInteractive) {
            window.electronAPI.onOverlayInteractive((interactive) => {
                setIsInteractive(interactive);
            });
        }

        // Request initial data
        if (window.electronAPI.requestOverlayUpdate) {
            window.electronAPI.requestOverlayUpdate();
        }

        // Global mouse move/up handlers for dragging only
        const handleGlobalMouseMove = (e: MouseEvent) => {
            // Handle Dragging
            if (isDragging) {
                const deltaX = e.screenX - lastScreenPos.current.x;
                const deltaY = e.screenY - lastScreenPos.current.y;

                if (deltaX !== 0 || deltaY !== 0) {
                    window.electronAPI.moveOverlay(deltaX, deltaY);
                    lastScreenPos.current = { x: e.screenX, y: e.screenY };
                }
            }
        };

        const handleGlobalMouseUpWithEvent = (e: MouseEvent) => {
            if (isDragging) {
                setIsDragging(false);
                // After drag ends, check if mouse is still over button
                if (btnRef.current && !isInteractive) {
                    const rect = btnRef.current.getBoundingClientRect();
                    const isOver =
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom;

                    if (!isOver) {
                        console.log('[OVERLAY] Drag ended outside button: Release focus');
                        window.electronAPI.setOverlayFocus(false);
                    }
                }
            }
        }

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUpWithEvent);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUpWithEvent);
        };
    }, [isDragging, isInteractive]); // Removed isHoveringBtn from deps as we use ref

    // Show even if empty
    if (profiles.length === 0 && !isInteractive) {
        return (
            <div className="overlay-container">
                <div className="profile-item stopped">
                    <span className="profile-name">D4 Helper Ready</span>
                    <span className="profile-state">IDLE</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`overlay-container ${isInteractive ? 'interactive' : ''}`}>




            <div className="profile-status-list">
                {profiles.map((profile) => (
                    <div
                        key={profile.startStopKey}
                        className={`profile-item ${profile.state}`}
                    >
                        <span className="profile-name">{profile.profileName}</span>
                        <span className="profile-key">[{profile.startStopKey}]</span>
                        <span className="profile-state">{profile.state.toUpperCase()}</span>
                    </div>
                ))}
            </div>

            {/* Helltide Timers */}
            {/* Helltide Timers removed - moved to separate window */}

            <div
                ref={btnRef}
                className={`layout-toggle-btn ${isInteractive ? 'active' : ''}`}
                // Removed onMouseEnter/onMouseLeave in favor of global hit testing
                // Added back as backup for robustness
                onMouseEnter={() => {
                    if (!isInteractive) {
                        console.log('[OVERLAY] Button MouseEnter');
                        window.electronAPI.setOverlayFocus(true);
                    }
                }}
                onMouseLeave={() => {
                    // Don't disable focus while dragging
                    if (!isDragging && !isInteractive) {
                        console.log('[OVERLAY] Button MouseLeave');
                        window.electronAPI.setOverlayFocus(false);
                    }
                }}
                onMouseDown={(e) => {
                    setIsDragging(true);
                    setDragStartPos({ x: e.clientX, y: e.clientY });
                    lastScreenPos.current = { x: e.screenX, y: e.screenY }; // Initialize screen pos
                }}
                onClick={(e) => {
                    // Calculate distance moved
                    const dist = Math.sqrt(
                        Math.pow(e.clientX - dragStartPos.x, 2) +
                        Math.pow(e.clientY - dragStartPos.y, 2)
                    );

                    // If moved more than 5 pixels, treat as drag and ignore click
                    if (dist > 5) {
                        console.log('Click ignored (Drag detected)');
                        return;
                    }

                    console.log('Button Clicked (No action)');
                }}
                title="Move Overlay"
            >
                ✥
            </div>


        </div>
    );
}
