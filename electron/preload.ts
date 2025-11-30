import { contextBridge, ipcRenderer } from 'electron';
import { AppConfig, MacroStatus } from '../src/types';

contextBridge.exposeInMainWorld('electronAPI', {
  // Macro controls
  macroStart: () => ipcRenderer.invoke('macro:start'),
  macroStop: () => ipcRenderer.invoke('macro:stop'),
  macroPause: (reason: string) => ipcRenderer.invoke('macro:pause', reason),
  macroResume: () => ipcRenderer.invoke('macro:resume'),

  // Config management
  configSave: (config: AppConfig) => ipcRenderer.invoke('config:save', config),
  configLoad: () => ipcRenderer.invoke('config:load'),

  // Window controls
  windowMinimize: () => ipcRenderer.invoke('window:minimize'),
  windowMaximize: () => ipcRenderer.invoke('window:maximize'),
  windowClose: () => ipcRenderer.invoke('window:close'),

  // Status updates
  onStatusUpdate: (callback: (status: MacroStatus) => void) => {
    ipcRenderer.on('status:update', (_, status) => callback(status));
  },
});

// Type declaration for window.electronAPI
declare global {
  interface Window {
    electronAPI: {
      macroStart: () => Promise<void>;
      macroStop: () => Promise<void>;
      macroPause: (reason: string) => Promise<void>;
      macroResume: () => Promise<void>;
      configSave: (config: AppConfig) => Promise<{ success: boolean }>;
      configLoad: () => Promise<AppConfig>;
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      onStatusUpdate: (callback: (status: MacroStatus) => void) => void;
    };
  }
}
