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
    const btnRef = useRef<HTMLDivElement>(null);
    const isHoveringRef = useRef(false); // Ref to track hover state without re-renders/dependency issues


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

        // Global mouse move/up handlers for dragging and hit testing
        const handleGlobalMouseMove = (e: MouseEvent) => {
            // 1. Handle Dragging
            if (isDragging) {
                window.electronAPI.moveOverlay(e.movementX, e.movementY);
            }

            // 2. Handle Hover/Focus (Hit Testing)
            // Only needed if NOT in interactive mode (Interactive mode is always focused)
            if (!isInteractive) {
                if (btnRef.current) {
                    const rect = btnRef.current.getBoundingClientRect();
                    const isOver =
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom;

                    if (isOver) {
                        if (!isHoveringRef.current) {
                            console.log('[OVERLAY] Hit Test: Enter');
                            isHoveringRef.current = true;
                            // setIsHoveringBtn(true); // Unused
                            window.electronAPI.setOverlayFocus(true);
                        }
                    } else {
                        // If not over, and we WERE hovering, and we are NOT dragging
                        if (isHoveringRef.current && !isDragging) {
                            console.log('[OVERLAY] Hit Test: Leave');
                            isHoveringRef.current = false;
                            // setIsHoveringBtn(false); // Unused
                            window.electronAPI.setOverlayFocus(false);
                        }
                    }
                }
            }
        };

        // We need to cast handleGlobalMouseUp to accept Event or change signature
        const handleGlobalMouseUpWithEvent = (e: MouseEvent) => {
            if (isDragging) {
                setIsDragging(false);

                // Check if we dropped outside
                if (btnRef.current && !isInteractive) {
                    const rect = btnRef.current.getBoundingClientRect();
                    const isOver =
                        e.clientX >= rect.left &&
                        e.clientX <= rect.right &&
                        e.clientY >= rect.top &&
                        e.clientY <= rect.bottom;

                    if (!isOver) {
                        console.log('[OVERLAY] Drop outside: Release focus');
                        isHoveringRef.current = false;
                        // setIsHoveringBtn(false); // Unused
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

    // Show even if empty (though backend should send all profiles now)
    if (profiles.length === 0 && !isInteractive) {
        return null;
    }

    return (
        <div className={`overlay-container ${isInteractive ? 'interactive' : ''}`}>


            <div
                ref={btnRef}
                className={`layout-toggle-btn ${isInteractive ? 'active' : ''}`}
                // Removed onMouseEnter/onMouseLeave in favor of global hit testing
                onMouseDown={(e) => {
                    setIsDragging(true);
                    setDragStartPos({ x: e.clientX, y: e.clientY });
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
                    // Interactive mode toggle removed as per user request
                }}
                title="Layout Mode"
            >
                📐
            </div>

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


        </div>
    );
}
