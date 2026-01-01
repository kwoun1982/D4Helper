import { ipcMain, BrowserWindow } from "electron";
import { AppConfig } from "../src/types";
import { saveConfig, getConfig } from "./config-manager";
import {
  startMacro,
  stopMacro,
  pauseMacro,
  resumeMacro,
  registerStopKeys,
  currentStatus,
} from "./macro-engine";

export function registerIpcHandlers() {
  ipcMain.handle("macro:start", async () => {
    startMacro();
  });

  ipcMain.handle("macro:stop", async () => {
    stopMacro("manual");
  });

  // Per-profile handlers
  ipcMain.handle("macro:start-profile", async (_, profileId: string) => {
    const { startProfile } = require("./macro-controller");
    const config = getConfig();
    startProfile(profileId, config);
    return { success: true };
  });

  ipcMain.handle("macro:stop-profile", async (_, profileId: string) => {
    const { stopProfile } = require("./macro-controller");
    const config = getConfig();
    stopProfile(profileId, config);
    return { success: true };
  });

  ipcMain.handle("macro:get-profile-state", async (_, profileId: string) => {
    const { getProfileState } = require("./profile-state");
    const state = getProfileState(profileId);
    return { state };
  });

  ipcMain.handle("macro:stop-all", async () => {
    const { stopAllProfiles } = require("./macro-controller");
    const config = getConfig();
    stopAllProfiles(config);
    return { success: true };
  });

  ipcMain.handle("config:save", async (_, config: AppConfig) => {
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
      const { globalShortcut } = require("electron");
      globalShortcut.unregisterAll();
      registerStopKeys(config.stopKeys);

      // Update overlay with new config (e.g. new profiles)
      const { sendOverlayUpdate } = require("./profile-state");
      sendOverlayUpdate();
    }
    return { success };
  });

  ipcMain.handle("config:load", async () => {
    return getConfig();
  });

  // File Dialog - Open JSON file
  ipcMain.handle("file:open", async () => {
    const { dialog } = require("electron");
    const fs = require("fs");

    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    try {
      const filePath = result.filePaths[0];
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const config: AppConfig = JSON.parse(fileContent);

      // Basic validation
      if (!config.profiles || !Array.isArray(config.profiles)) {
        throw new Error("Invalid config format: missing profiles array");
      }

      return { success: true, config, filePath };
    } catch (error) {
      console.error("Error loading config file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // File Dialog - Save JSON file as
  ipcMain.handle("file:save", async (_, config: AppConfig) => {
    const { dialog } = require("electron");
    const fs = require("fs");

    const result = await dialog.showSaveDialog({
      defaultPath: "dia4helper_config.json",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, canceled: true };
    }

    try {
      const fileContent = JSON.stringify(config, null, 2);
      fs.writeFileSync(result.filePath, fileContent, "utf-8");
      return { success: true, filePath: result.filePath };
    } catch (error) {
      console.error("Error saving config file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Window Controls
  ipcMain.handle("window:minimize", async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.minimize();
  });

  ipcMain.handle("window:close", async () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.close();
  });

  // Overlay Controls
  ipcMain.handle("overlay:set-interactive", async (_, interactive: boolean) => {
    const { setOverlayInteractive } = require("./overlay-window");
    const {
      setHelltideOverlayInteractive,
    } = require("./helltide-overlay-window");
    setOverlayInteractive(interactive);
    setHelltideOverlayInteractive(interactive);
    return { success: true };
  });

  ipcMain.handle("overlay:reset-position", async () => {
    const { resetOverlayPosition } = require("./overlay-window");
    const {
      resetHelltideOverlayPosition,
    } = require("./helltide-overlay-window");

    resetOverlayPosition();
    resetHelltideOverlayPosition();

    console.log("[MAIN] All overlay positions reset to default");
    return { success: true };
  });

  ipcMain.handle("overlay:move", async (_, { deltaX, deltaY }) => {
    const { moveOverlay } = require("./overlay-window");
    moveOverlay(deltaX, deltaY);
    return { success: true };
  });

  ipcMain.handle("overlay:set-focus", (_, focused) => {
    const { setOverlayFocus } = require("./overlay-window");
    setOverlayFocus(focused);
  });

  ipcMain.handle("overlay:request-update", () => {
    const { sendOverlayUpdate } = require("./profile-state");
    sendOverlayUpdate();
  });

  ipcMain.handle("overlay:toggle", (_, enabled) => {
    console.log(`[MAIN] Toggling overlay: ${enabled}`);
    const config = getConfig();
    config.overlay.enabled = enabled;
    require("./config-manager").saveConfig(config);

    const { createOverlayWindow, destroyOverlay } = require("./overlay-window");
    const { sendOverlayUpdate } = require("./profile-state");

    if (enabled) {
      createOverlayWindow();
      setTimeout(() => {
        sendOverlayUpdate();
      }, 500);
    } else {
      destroyOverlay();
    }
    return { success: true };
  });

  ipcMain.handle("helltide:toggle", (_, { feature, enabled }) => {
    const config = getConfig();
    if (feature === "helltide") config.helltideEnabled = enabled;
    if (feature === "worldBoss") config.worldBossEnabled = enabled;
    if (feature === "legion") config.legionEnabled = enabled;

    require("./config-manager").saveConfig(config);

    const {
      startHelltideCrawler,
      stopHelltideCrawler,
    } = require("./helltide-crawler");

    const {
      sendHelltideUpdate,
      sendHelltideStateChange,
    } = require("./overlay-window");

    const {
      createHelltideOverlayWindow,
      destroyHelltideOverlay,
      sendHelltideUpdateToOverlay,
      sendHelltideStateChangeToOverlay,
    } = require("./helltide-overlay-window");

    // Notify overlay about state change
    sendHelltideStateChange({ feature, enabled });
    sendHelltideStateChangeToOverlay({ feature, enabled });

    // Check if any feature is enabled
    if (
      config.helltideEnabled ||
      config.worldBossEnabled ||
      config.legionEnabled
    ) {
      createHelltideOverlayWindow();

      startHelltideCrawler((data: any) => {
        const win = BrowserWindow.getAllWindows().find(
          (w) => !w.isDestroyed() && w.getTitle() === "D4 Helper"
        );
        if (win) {
          win.webContents.send("helltide:update", data);
        }
        sendHelltideUpdate(data); // Legacy/Main overlay
        sendHelltideUpdateToOverlay(data); // New overlay
      });
    } else {
      stopHelltideCrawler();
      destroyHelltideOverlay();
    }
    return { success: true };
  });

  // Helltide Overlay Controls
  ipcMain.handle("helltide-overlay:move", async (_, { deltaX, deltaY }) => {
    const { moveHelltideOverlay } = require("./helltide-overlay-window");
    moveHelltideOverlay(deltaX, deltaY);
    return { success: true };
  });

  ipcMain.handle("helltide-overlay:set-focus", (_, focused) => {
    const { setHelltideOverlayFocus } = require("./helltide-overlay-window");
    setHelltideOverlayFocus(focused);
  });

  // Armory
  ipcMain.handle("armory:get-account", async (_, battleTag: string) => {
    const { getAccount } = require("./armory-fetcher");
    return getAccount(battleTag);
  });

  ipcMain.handle("armory:get-character", async (_, { battleTag, heroId }) => {
    const { getCharacter } = require("./armory-fetcher");
    return getCharacter(battleTag, heroId);
  });
}
