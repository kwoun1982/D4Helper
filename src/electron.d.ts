import { AppConfig, MacroStatus } from "./types";

export interface ElectronAPI {
  macroStart: () => Promise<void>;
  macroStop: () => Promise<void>;
  startProfile: (profileId: string) => Promise<void>;
  stopProfile: (profileId: string) => Promise<void>;
  configSave: (config: AppConfig) => Promise<{ success: boolean }>;
  configLoad: () => Promise<AppConfig>;
  onStatusUpdate: (callback: (status: MacroStatus) => void) => void;
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
