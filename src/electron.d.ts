import { AppConfig, MacroStatus } from "./types";

export interface ElectronAPI {
  macroStart: () => Promise<void>;
  macroStop: () => Promise<void>;
  startProfile: (profileId: string) => Promise<void>;
  stopProfile: (profileId: string) => Promise<void>;
  configSave: (config: AppConfig) => Promise<{ success: boolean }>;
  configLoad: () => Promise<AppConfig>;
  fileOpen: () => Promise<{
    success: boolean;
    config?: AppConfig;
    filePath?: string;
    error?: string;
    canceled?: boolean;
  }>;
  fileSave: (config: AppConfig) => Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
    canceled?: boolean;
  }>;
  onStatusUpdate: (callback: (status: MacroStatus) => void) => void;
  onOverlayUpdate: (
    callback: (
      profiles: Array<{
        profileName: string;
        startStopKey: string;
        state: "running" | "paused" | "stopped";
      }>
    ) => void
  ) => void;
  onOverlayArrowUpdate: (
    callback: (arrows: {
      up: boolean;
      down: boolean;
      left: boolean;
      right: boolean;
    }) => void
  ) => void;
  setOverlayInteractive: (interactive: boolean) => Promise<void>;
  resetOverlayPosition: () => Promise<void>;
  onOverlayInteractive: (callback: (interactive: boolean) => void) => void;
  setOverlayFocus: (focused: boolean) => Promise<void>;
  requestOverlayUpdate: () => Promise<void>;
  moveOverlay: (deltaX: number, deltaY: number) => Promise<void>;
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
