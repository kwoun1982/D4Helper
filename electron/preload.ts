import { contextBridge, ipcRenderer } from "electron";
import { AppConfig, MacroStatus } from "../src/types";

contextBridge.exposeInMainWorld("electronAPI", {
  // Macro controls
  macroStart: () => ipcRenderer.invoke("macro:start"),
  macroStop: () => ipcRenderer.invoke("macro:stop"),
  macroPause: (reason: string) => ipcRenderer.invoke("macro:pause", reason),
  macroResume: () => ipcRenderer.invoke("macro:resume"),

  // Per-profile macro controls
  startProfile: (profileId: string) =>
    ipcRenderer.invoke("macro:start-profile", profileId),
  stopProfile: (profileId: string) =>
    ipcRenderer.invoke("macro:stop-profile", profileId),
  getProfileState: (profileId: string) =>
    ipcRenderer.invoke("macro:get-profile-state", profileId),
  stopAllProfiles: () => ipcRenderer.invoke("macro:stop-all"),

  // Config management
  configSave: (config: AppConfig) => ipcRenderer.invoke("config:save", config),
  configLoad: () => ipcRenderer.invoke("config:load"),
  fileOpen: () => ipcRenderer.invoke("file:open"),
  fileSave: (config: AppConfig) => ipcRenderer.invoke("file:save", config),

  // Window controls
  windowMinimize: () => ipcRenderer.invoke("window:minimize"),
  windowMaximize: () => ipcRenderer.invoke("window:maximize"),
  windowClose: () => ipcRenderer.invoke("window:close"),

  // Status updates
  onStatusUpdate: (callback: (status: MacroStatus) => void) => {
    ipcRenderer.on("status:update", (_, status) => callback(status));
  },

  // Overlay updates
  onOverlayUpdate: (
    callback: (
      profiles: Array<{
        profileName: string;
        startStopKey: string;
        state: "running" | "paused" | "stopped";
      }>
    ) => void
  ) => {
    ipcRenderer.on("overlay:update", (_, profiles) => callback(profiles));
  },
  setOverlayInteractive: (interactive: boolean) =>
    ipcRenderer.invoke("overlay:set-interactive", interactive),
  resetOverlayPosition: () => ipcRenderer.invoke("overlay:reset-position"),
  onOverlayInteractive: (callback: (interactive: boolean) => void) => {
    ipcRenderer.on("overlay:interactive", (_, interactive) =>
      callback(interactive)
    );
  },
  setOverlayFocus: (focused: boolean) =>
    ipcRenderer.invoke("overlay:set-focus", focused),
  requestOverlayUpdate: () => ipcRenderer.invoke("overlay:request-update"),
  moveOverlay: (deltaX: number, deltaY: number) =>
    ipcRenderer.invoke("overlay:move", { deltaX, deltaY }),
  toggleOverlay: (enabled: boolean) =>
    ipcRenderer.invoke("overlay:toggle", enabled),

  // Helltide
  helltideToggle: (feature: string, enabled: boolean) =>
    ipcRenderer.invoke("helltide:toggle", { feature, enabled }),
  onHelltideUpdate: (callback: (data: any) => void) =>
    ipcRenderer.on("helltide:update", (_event, value) => callback(value)),
  onHelltideStateChange: (
    callback: (state: { feature: string; enabled: boolean }) => void
  ) =>
    ipcRenderer.on("helltide:state-change", (_event, state) => callback(state)),

  moveHelltideOverlay: (deltaX: number, deltaY: number) =>
    ipcRenderer.invoke("helltide-overlay:move", { deltaX, deltaY }),
  setHelltideOverlayFocus: (focused: boolean) =>
    ipcRenderer.invoke("helltide-overlay:set-focus", focused),

  // Armory
  getArmoryAccount: (battleTag: string) =>
    ipcRenderer.invoke("armory:get-account", battleTag),
  getArmoryCharacter: (battleTag: string, heroId: string) =>
    ipcRenderer.invoke("armory:get-character", { battleTag, heroId }),
});

// Type declaration for window.electronAPI
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
      helltideToggle: (
        feature: string,
        enabled: boolean
      ) => Promise<{ success: boolean }>;
      onHelltideUpdate: (callback: (data: any) => void) => void;
    };
  }
}
