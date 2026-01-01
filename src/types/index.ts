// src/types/index.ts

// 8개 고정 슬롯용 스킬 설정
export interface SkillSlotConfig {
  slotNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  key: string; // '1', '2', 'Space', 'Q', 'MouseLeft', 'MouseRight', 'MouseMiddle', '' (empty)
  interval: number; // ms 단위 (0~300000, 최대 5분)
  enabled: boolean; // 슬롯 활성화 여부
}

// 상수 정의
export const MAX_INTERVAL = 300000; // 최대 인터벌: 5분 (300,000ms)
export const SLIDER_MAX_INTERVAL = 60000; // 슬라이더 최대값: 1분 (60,000ms)

// Stop Keys 설정 (디아블로 UI 키)
export interface StopKeysConfig {
  inventory: boolean; // C
  skills: boolean; // K
  follower: boolean; // F
  map: boolean; // Tab
  worldMap: boolean; // M
  townPortal: boolean; // T
  chat: boolean; // Enter
  whisper: boolean; // /
}

// Special Key 설정
export interface SpecialKeyConfig {
  key: string; // Hold to Pause 키
  enabled: boolean;
}

// 프로필 정의
export interface MacroProfile {
  id: string;
  name: string;
  startStopKey: string;
  skillSlots: SkillSlotConfig[];
}

// 전체 앱 설정
export interface AppConfig {
  version: string;
  language: "ko" | "en" | "ja" | "zh";

  // Global Settings
  stopKeys: StopKeysConfig;
  options: {
    randomDelay: boolean;
    randomDelayPercent: number; // ±%
  };

  // Profile System (Multi-execution support)
  profiles: MacroProfile[];
  runningProfileIds: string[]; // Profiles currently executing
  selectedProfileId: string; // Profile selected in UI for editing

  // Overlay Settings
  overlay: {
    enabled: boolean;
    position: { x: number; y: number };
  };

  // Event Timer Settings
  helltideEnabled: boolean;
  worldBossEnabled: boolean;
  legionEnabled: boolean;

  // Helltide Overlay Settings (position persistence)
  helltideOverlay?: {
    position?: { x: number; y: number };
  };

  // Main Window Settings
  windowPosition?: { x: number; y: number };

  // Deprecated (Migration purpose only)
  activeProfileId?: string; // Old single-profile system
  startStopKey?: string;
  skillSlots?: SkillSlotConfig[];
  specialKey?: SpecialKeyConfig; // Moved to profile or deprecated? User didn't specify, but usually global.
  // Let's keep specialKey global for now as per plan discussion, or deprecated if we want it per profile.
  // Plan said: "Let's keep SpecialKey per profile? Or global? ... Let's move startStopKey and skillSlots to the profile."
  // I will keep specialKey global for now to minimize friction, or move it if needed.
  // Actually, "Hold to Pause" is likely a global preference.
}

// 매크로 상태
export interface MacroStatus {
  state: "running" | "stopped" | "paused";
  activeSlots: number[]; // 현재 활성화된 슬롯 번호들
  pauseReason?: "manual" | "stopKey" | "specialKey";
  runningProfiles: {
    [profileId: string]: {
      state: "running" | "paused";
      startedAt: number;
    };
  };
}

// Stop Key 매핑
export const STOP_KEY_MAPPING: Record<keyof StopKeysConfig, string> = {
  inventory: "C",
  skills: "K",
  follower: "F",
  map: "Tab",
  worldMap: "M",
  townPortal: "T",
  chat: "Enter",
  whisper: "/",
};

// 기본 설정 (처음 설치 시 깔끔한 상태)
const DEFAULT_SKILL_SLOTS: SkillSlotConfig[] = [
  { slotNumber: 1, key: "", interval: 1000, enabled: false },
  { slotNumber: 2, key: "", interval: 1000, enabled: false },
  { slotNumber: 3, key: "", interval: 1000, enabled: false },
  { slotNumber: 4, key: "", interval: 1000, enabled: false },
  { slotNumber: 5, key: "", interval: 1000, enabled: false },
  { slotNumber: 6, key: "", interval: 1000, enabled: false },
  { slotNumber: 7, key: "", interval: 1000, enabled: false },
  { slotNumber: 8, key: "", interval: 1000, enabled: false },
];

export const DEFAULT_CONFIG: AppConfig = {
  version: "2.2.0", // Version bump
  language: "ko",

  stopKeys: {
    inventory: false,
    skills: false,
    follower: false,
    map: false,
    worldMap: false,
    townPortal: false,
    chat: false,
    whisper: false,
  },
  options: {
    randomDelay: false,
    randomDelayPercent: 10,
  },

  profiles: [
    {
      id: "default",
      name: "기본 프로필",
      startStopKey: "F1",
      skillSlots: DEFAULT_SKILL_SLOTS,
    },
  ],
  runningProfileIds: [],
  selectedProfileId: "default",

  overlay: {
    enabled: true,
    position: { x: 10, y: 10 },
  },

  helltideEnabled: false,
  worldBossEnabled: false,
  legionEnabled: false,
};

export interface EventTimersData {
  helltide: {
    status: string; // "Active" | "Next in"
    time: string;
    nextTime?: string;
  };
  worldBoss: {
    name: string;
    time: string;
    nextTime?: string;
  };
  legion: {
    time: string;
    nextTime?: string;
  };
}

// Armory Types
export interface ArmoryAccount {
  battleTag: string;
  characters: ArmoryCharacterSummary[];
}

export interface ArmoryCharacterSummary {
  id: string;
  name: string;
  class: string;
  level: number;
  hardcore: boolean;
  seasonal: boolean;
}

export interface ArmoryCharacterDetails extends ArmoryCharacterSummary {
  power: number;
  life: number;
  strength: number;
  intelligence: number;
  willpower: number;
  dexterity: number;
  equipment: ArmoryEquipment[];
  skills: ArmorySkill[];
}

export interface ArmoryEquipment {
  slot: string;
  name: string;
  quality: string;
  power: number;
}

export interface ArmorySkill {
  name: string;
  rank: number;
}

// IPC 채널 타입
export interface IpcChannels {
  "macro:start": (config: AppConfig) => Promise<void>;
  "macro:stop": () => Promise<void>;
  "macro:pause": (reason: string) => Promise<void>;
  "macro:resume": () => Promise<void>;
  "key:press": (key: string) => Promise<{ success: boolean }>;
  "config:save": (config: AppConfig) => Promise<{ success: boolean }>;
  "config:load": () => Promise<AppConfig>;
  "status:update": (status: MacroStatus) => void;
  "overlay:toggle": (enabled: boolean) => Promise<{ success: boolean }>;
}
