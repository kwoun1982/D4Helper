import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiabloButton from './ui/DiabloButton';
import DiabloInput from './ui/DiabloInput';
import { ArmoryAccount, ArmoryCharacterDetails } from '../types';
import './ArmoryModal.css';

interface ArmoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ArmoryModal({ isOpen, onClose }: ArmoryModalProps) {
    const { t } = useTranslation();
    const [battleTag, setBattleTag] = useState('');
    const [account, setAccount] = useState<ArmoryAccount | null>(null);
    const [selectedChar, setSelectedChar] = useState<ArmoryCharacterDetails | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!battleTag) return;
        setLoading(true);
        setError(null);
        setAccount(null);
        setSelectedChar(null);

        try {
            // @ts-ignore - electronAPI types might not be fully updated in IDE context yet
            const data = await window.electronAPI.getArmoryAccount(battleTag);
            if (data) {
                setAccount(data);
            } else {
                setError(t('armory.notFound', 'Account not found or API unavailable'));
            }
        } catch (err) {
            setError(t('armory.error', 'Error fetching data'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChar = async (charId: string) => {
        if (!account) return;
        setLoading(true);
        setError(null);

        try {
            // @ts-ignore
            const data = await window.electronAPI.getArmoryCharacter(account.battleTag, charId);
            if (data) {
                setSelectedChar(data);
            } else {
                setError(t('armory.charError', 'Failed to load character details'));
            }
        } catch (err) {
            setError(t('armory.error', 'Error fetching data'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="armory-modal-overlay">
            <div className="armory-modal-content">
                <div className="armory-header">
                    <h2>Diablo 4 Armory</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="armory-search">
                    <DiabloInput
                        value={battleTag}
                        onChange={setBattleTag}
                        placeholder="BattleTag (e.g. Player#1234)"
                        style={{ width: '300px' }}
                    />
                    <div style={{ width: '10px' }}></div>
                    <DiabloButton onClick={handleSearch} disabled={loading}>Search</DiabloButton>
                </div>

                <div className="armory-body">
                    {loading && <div className="loading-spinner">Loading...</div>}
                    {error && <div className="error-message">{error}</div>}

                    {!loading && !selectedChar && account && (
                        <div className="character-list">
                            <h3>{account.battleTag}'s Characters</h3>
                            <div className="char-grid">
                                {account.characters.map((char) => (
                                    <div key={char.id} className="char-card" onClick={() => handleSelectChar(char.id)}>
                                        <div className="char-name">{char.name}</div>
                                        <div className="char-info">Lv. {char.level} {char.class}</div>
                                        <div className="char-mode">
                                            {char.hardcore ? 'Hardcore' : 'Softcore'}
                                            {char.seasonal ? ' (Seasonal)' : ' (Eternal)'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && selectedChar && (
                        <div className="character-details">
                            <button className="back-btn" onClick={() => setSelectedChar(null)}>← Back to List</button>

                            <div className="char-header">
                                <h3>{selectedChar.name} <span className="level">Lv. {selectedChar.level} {selectedChar.class}</span></h3>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-box">
                                    <span className="label">Attack Power</span>
                                    <span className="value">{selectedChar.power}</span>
                                </div>
                                <div className="stat-box">
                                    <span className="label">Armor</span>
                                    <span className="value">{selectedChar.strength}</span> {/* Mapping might be wrong, using strength as placeholder */}
                                </div>
                                <div className="stat-box">
                                    <span className="label">Life</span>
                                    <span className="value">{selectedChar.life}</span>
                                </div>
                            </div>

                            <div className="equipment-list">
                                <h4>Equipment</h4>
                                {selectedChar.equipment.map((item, idx) => (
                                    <div key={idx} className="equip-item">
                                        <span className="slot">{item.slot}</span>
                                        <span className={`name quality-${item.quality.toLowerCase()}`}>{item.name}</span>
                                        <span className="power">{item.power} IP</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
