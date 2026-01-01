import { AppConfig, MacroStatus, EventTimersData } from "./index";

declare global {
  interface Window {
    electronAPI: {
      macroStart: () => Promise<void>;
      macroStop: () => Promise<void>;
      macroPause: (reason: string) => Promise<void>;
      macroResume: () => Promise<void>;
      startProfile: (profileId: string) => Promise<{ success: boolean }>;
      stopProfile: (profileId: string) => Promise<{ success: boolean }>;
      getProfileState: (
        profileId: string
      ) => Promise<{ state: "running" | "paused" | "stopped" }>;
      stopAllProfiles: () => Promise<{ success: boolean }>;
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
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      onStatusUpdate: (callback: (status: MacroStatus) => void) => void;
      onOverlayUpdate: (
        callback: (
          profiles: Array<{
            profileName: string;
            startStopKey: string;
            state: "running" | "paused";
          }>
        ) => void
      ) => void;

      setOverlayInteractive: (interactive: boolean) => Promise<void>;
      resetOverlayPosition: () => Promise<void>;
      onOverlayInteractive: (callback: (interactive: boolean) => void) => void;
      toggleOverlay: (enabled: boolean) => Promise<{ success: boolean }>;

      setOverlayFocus: (focused: boolean) => Promise<void>;
      requestOverlayUpdate: () => Promise<void>;
      moveOverlay: (deltaX: number, deltaY: number) => Promise<void>;
      onOverlayArrowUpdate: (
        callback: (arrows: {
          up: boolean;
          down: boolean;
          left: boolean;
          right: boolean;
        }) => void
      ) => void;

      // Helltide
      helltideToggle: (
        feature: string,
        enabled: boolean
      ) => Promise<{ success: boolean }>;
      onHelltideUpdate: (callback: (data: EventTimersData) => void) => void;
      onHelltideStateChange: (
        callback: (state: { feature: string; enabled: boolean }) => void
      ) => void;
      moveHelltideOverlay: (
        deltaX: number,
        deltaY: number
      ) => Promise<{ success: boolean }>;
      setHelltideOverlayFocus: (focused: boolean) => Promise<void>;

      // Armory
      getArmoryAccount: (battleTag: string) => Promise<any>;
      getArmoryCharacter: (battleTag: string, heroId: string) => Promise<any>;
    };
  }
}
