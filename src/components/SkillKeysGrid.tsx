
import { SkillSlotConfig } from '../types';
import SkillSlot from './SkillSlot';

import './SkillKeysGrid.css';

interface SkillKeysGridProps {
  slots: SkillSlotConfig[];
  onChange: (slots: SkillSlotConfig[]) => void;
}

export default function SkillKeysGrid({ slots, onChange }: SkillKeysGridProps) {

  const handleSlotChange = (updatedSlot: SkillSlotConfig) => {
    const updatedSlots = slots.map((slot) =>
      slot.slotNumber === updatedSlot.slotNumber ? updatedSlot : slot
    );
    onChange(updatedSlots);
  };

  return (
    <div className="skill-keys-grid">
      <h3 className="section-title">SKILL KEYS</h3>
      <div className="grid-container">
        {slots.map((slot) => (
          <SkillSlot
            key={slot.slotNumber}
            config={slot}
            onChange={handleSlotChange}
          />
        ))}
      </div>
    </div>
  );
}
