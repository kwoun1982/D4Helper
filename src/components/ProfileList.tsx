import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MacroProfile, MacroStatus } from '../types';
import './ProfileList.css';

interface ProfileListProps {
    profiles: MacroProfile[];
    selectedProfileId: string;
    status: MacroStatus;
    onSelect: (id: string) => void;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onAdd: () => void;
    onDelete: (id: string) => void;
    onRename: (id: string, newName: string) => void;
    onKeyChange: (profileId: string, key: string) => void;
    onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
    disabled: boolean;
}

export default function ProfileList({
    profiles,
    selectedProfileId,
    status,
    onSelect,
    onStart,
    onStop,
    onAdd,
    onDelete,
    onRename,
    onKeyChange,
    onShowToast,
    disabled
}: ProfileListProps) {
    const { t } = useTranslation();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [recordingKeyFor, setRecordingKeyFor] = useState<string | null>(null);

    // Key recording handler
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            console.log('KeyDown event:', {
                recordingKeyFor,
                key: e.key,
                code: e.code,
                ctrlKey: e.ctrlKey,
                altKey: e.altKey,
                shiftKey: e.shiftKey
            });

            if (recordingKeyFor) {
                e.preventDefault();
                e.stopPropagation();

                let keyName = e.key;
                console.log('Processing key:', keyName);

                // Function Keys (F1-F12)
                if (/^F\d+$/.test(keyName)) {
                    // Keep as is
                    console.log('Function key detected:', keyName);
                }
                // Space
                else if (keyName === ' ' || keyName === 'Spacebar') {
                    keyName = 'Space';
                }
                // Special Keys
                else if (keyName === 'Escape') {
                    console.log('Escape pressed, canceling recording');
                    setRecordingKeyFor(null);
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

                console.log('Final key name:', keyName, 'for profile:', recordingKeyFor);
                onKeyChange(recordingKeyFor, keyName);
                setRecordingKeyFor(null);
            }
        };

        if (recordingKeyFor) {
            console.log('Adding keydown listener for profile:', recordingKeyFor);
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (recordingKeyFor) {
                console.log('Removing keydown listener');
            }
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [recordingKeyFor, onKeyChange]);

    const handleStartEdit = (profile: MacroProfile) => {
        if (disabled) return;
        setEditingId(profile.id);
        setEditName(profile.name);
    };

    const handleFinishEdit = () => {
        if (editingId) {
            onRename(editingId, editName);
            setEditingId(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleFinishEdit();
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

    return (
        <div className="profile-list panel-box">
            <div className="profile-header">
                <h3 className="section-title">PROFILES</h3>
                <button
                    className="diablo-btn sm success"
                    onClick={onAdd}
                    disabled={disabled}
                    title="Add Profile"
                >
                    +
                </button>
            </div>

            <div className="profile-items">
                {profiles.map((profile) => {
                    const isSelected = profile.id === selectedProfileId;
                    const profileState = status.runningProfiles[profile.id];
                    const isRunning = profileState?.state === 'running';
                    const isPaused = profileState?.state === 'paused';
                    const isRecording = recordingKeyFor === profile.id;

                    return (
                        <div key={profile.id} className="profile-item-wrapper">
                            <div
                                className={`profile-item ${isSelected ? 'active' : ''}`}
                                onClick={() => !editingId && onSelect(profile.id)}
                            >
                                {/* Status Indicator */}
                                {(isRunning || isPaused) && (
                                    <div className={`profile-status-indicator ${isRunning ? 'running' : isPaused ? 'paused' : 'stopped'}`} />
                                )}

                                {editingId === profile.id ? (
                                    <input
                                        type="text"
                                        className="profile-name-input"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onBlur={handleFinishEdit}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                    />
                                ) : (
                                    <span
                                        className="profile-name"
                                        onDoubleClick={() => handleStartEdit(profile)}
                                    >
                                        {profile.name}
                                    </span>
                                )}

                                {/* Key Badge - only show when NOT selected */}
                                {!isSelected && (
                                    <span className="key-badge" title="Start/Stop Key">
                                        {profile.startStopKey || 'F1'}
                                    </span>
                                )}

                                <div className="profile-actions">
                                    {/* Delete Button - only visible on hover for non-selected items */}
                                    {profiles.length > 1 && (
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!disabled) {
                                                    const profileName = profile.name;
                                                    onDelete(profile.id);
                                                    onShowToast(`"${profileName}" ${t('profile.deleted')}`, 'success');
                                                }
                                            }}
                                            disabled={disabled}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Key Configuration (shown when selected) */}
                            {isSelected && (
                                <>
                                    <div className="profile-key-config">
                                        <span className="key-config-label">{t('profile.startStopKey')}:</span>
                                        <button
                                            className={`key-config-btn ${isRecording ? 'recording' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setRecordingKeyFor(profile.id);
                                            }}
                                            disabled={isRunning || isPaused}
                                            title="Click to set key"
                                        >
                                            {isRecording ? t('profile.waitingInput') : profile.startStopKey || 'F1'}
                                        </button>
                                    </div>

                                    {/* Delete Button - moved below key config panel */}
                                    {profiles.length > 1 && (
                                        <div className="profile-delete-wrapper">
                                            <button
                                                className="delete-btn-bottom"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!disabled) {
                                                        const profileName = profile.name;
                                                        onDelete(profile.id);
                                                        onShowToast(`"${profileName}" ${t('profile.deleted')}`, 'success');
                                                    }
                                                }}
                                                disabled={disabled}
                                            >
                                                ✕ {t('profile.delete')}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
