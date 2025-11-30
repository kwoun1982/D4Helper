import { ipcMain, BrowserWindow } from 'electron';
import { AppConfig } from '../src/types';
import { saveConfig, getConfig } from './config-manager';
import { startMacro, stopMacro, pauseMacro, resumeMacro, registerStopKeys, currentStatus } from './macro-engine';

export function registerIpcHandlers() {
  ipcMain.handle('macro:start', async () => {
    startMacro();
  });

  ipcMain.handle('macro:stop', async () => {
    stopMacro('manual');
  });

  ipcMain.handle('config:save', async (_, config: AppConfig) => {
    const success = saveConfig(config);
    if (success) {
      // Re-register hotkeys when config is saved
      // Note: We need to be careful about unregistering F1 if we used globalShortcut, but we use poller now.
      // We should re-register stop keys.
      // Ideally, main.ts should handle this orchestration, or we expose a 'reloadConfiguration' function.
      // For simplicity, we'll just re-register stop keys here, but we need to unregister old ones first.
      // Since we don't have easy access to 'unregisterAll' here without importing 'electron', 
      // and we might want to keep F1 poller running.
      
      // Let's just return success and let the renderer or main process handle the reload if needed.
      // Actually, the requirement is usually that saving config applies it immediately.
      
      // We will emit an event or call a function to refresh hotkeys.
      // For now, let's assume the user might need to restart or we handle it in main.ts via a listener?
      // Or we can just import registerStopKeys and call it.
      
      // BUT, we need to clear old keys first.
      // Let's import globalShortcut to clear.
      const { globalShortcut } = require('electron');
      globalShortcut.unregisterAll();
      registerStopKeys(config.stopKeys);
    }
    return { success };
  });

  ipcMain.handle('config:load', async () => {
    return getConfig();
  });

  // Window Controls
  ipcMain.handle('window:minimize', async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });

  ipcMain.handle('window:close', async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });
}
