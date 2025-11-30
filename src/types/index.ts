// src/types/index.ts

// 8개 고정 슬롯용 스킬 설정
export interface SkillSlotConfig {
  slotNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  key: string;           // '1', '2', 'Space', 'Q', 'MouseLeft', 'MouseRight', 'MouseMiddle', '' (empty)
  interval: number;      // ms 단위 (0~2000)
  enabled: boolean;      // 슬롯 활성화 여부
}

// Stop Keys 설정 (디아블로 UI 키)
export interface StopKeysConfig {
  inventory: boolean;    // C
  skills: boolean;       // K
  follower: boolean;     // F
  map: boolean;          // Tab
  worldMap: boolean;     // M
  townPortal: boolean;   // T
  chat: boolean;         // Enter
  whisper: boolean;      // /
}

// Special Key 설정
export interface SpecialKeyConfig {
  key: string;           // Hold to Pause 키
  enabled: boolean;
}

// 전체 앱 설정
export interface AppConfig {
  version: string;
  language: 'ko' | 'en' | 'ja' | 'zh';
  startStopKey: string;  // 기본 'F1'
  skillSlots: SkillSlotConfig[];
  stopKeys: StopKeysConfig;
  specialKey: SpecialKeyConfig;
  options: {
    randomDelay: boolean;
    randomDelayPercent: number; // ±%
  };
}

// 매크로 상태
export interface MacroStatus {
  state: 'running' | 'stopped' | 'paused';
  activeSlots: number[];  // 현재 활성화된 슬롯 번호들
  pauseReason?: 'manual' | 'stopKey' | 'specialKey';
}

// Stop Key 매핑
export const STOP_KEY_MAPPING: Record<keyof StopKeysConfig, string> = {
  inventory: 'C',
  skills: 'K',
  follower: 'F',
  map: 'Tab',
  worldMap: 'M',
  townPortal: 'T',
  chat: 'Enter',
  whisper: '/',
};

// 기본 설정
export const DEFAULT_CONFIG: AppConfig = {
  version: '1.0.1',
  language: 'ko',
  startStopKey: 'F1',
  skillSlots: [
    { slotNumber: 1, key: '1', interval: 11, enabled: true },
    { slotNumber: 2, key: '2', interval: 1000, enabled: true },
    { slotNumber: 3, key: '3', interval: 1008, enabled: false },
    { slotNumber: 4, key: '', interval: 305, enabled: false },
    { slotNumber: 5, key: '5', interval: 500, enabled: true },
    { slotNumber: 6, key: '6', interval: 310, enabled: true },
    { slotNumber: 7, key: 'Space', interval: 100, enabled: true },
    { slotNumber: 8, key: 'Q', interval: 1000, enabled: true },
  ],
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
  specialKey: {
    key: '',
    enabled: false,
  },
  options: {
    randomDelay: false,
    randomDelayPercent: 10,
  },
};

// IPC 채널 타입
export interface IpcChannels {
  'macro:start': (config: AppConfig) => Promise<void>;
  'macro:stop': () => Promise<void>;
  'macro:pause': (reason: string) => Promise<void>;
  'macro:resume': () => Promise<void>;
  'key:press': (key: string) => Promise<{ success: boolean }>;
  'config:save': (config: AppConfig) => Promise<{ success: boolean }>;
  'config:load': () => Promise<AppConfig>;
  'status:update': (status: MacroStatus) => void;
}
