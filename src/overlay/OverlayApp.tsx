import { useState, useEffect } from 'react';
import './overlay.css';

interface ProfileStatus {
    profileName: string;
    startStopKey: string;
    state: 'running' | 'paused' | 'stopped';
}

export default function OverlayApp() {
    const [profiles, setProfiles] = useState<ProfileStatus[]>([]);
    const [isInteractive, setIsInteractive] = useState(false);

    useEffect(() => {
        const handleUpdate = (updatedProfiles: ProfileStatus[]) => {
            setProfiles(updatedProfiles);
        };

        window.electronAPI.onOverlayUpdate(handleUpdate);

        // Listen for interactive mode toggle
        if (window.electronAPI.onOverlayInteractive) {
            window.electronAPI.onOverlayInteractive((interactive) => {
                setIsInteractive(interactive);
            });
        }
    }, []);

    // Show even if empty (though backend should send all profiles now)
    if (profiles.length === 0 && !isInteractive) {
        return null;
    }

    return (
        <div className={`overlay-container ${isInteractive ? 'interactive' : ''}`}>
            {isInteractive && <div className="drag-handle">DRAG HERE</div>}
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
