import Store from "electron-store";
import { AppConfig, DEFAULT_CONFIG, MacroProfile } from "../src/types";

const store = new Store<{ config: AppConfig }>({
  defaults: { config: DEFAULT_CONFIG },
});

// In-memory cache of the current configuration
export let currentConfig: AppConfig = store.get("config");

export function getConfig(): AppConfig {
  let config = store.get("config");

  // Migration 1: Original config to Profile system
  if (!config.profiles || config.profiles.length === 0) {
    console.log("Migrating config to Profile system...");
    const defaultProfile: MacroProfile = {
      id: "default",
      name: "기본 프로필",
      startStopKey: config.startStopKey || "F1",
      skillSlots: config.skillSlots || DEFAULT_CONFIG.profiles[0].skillSlots,
    };

    config.profiles = [defaultProfile];
    config.runningProfileIds = [];
    config.selectedProfileId = "default";

    // Remove old keys
    delete config.startStopKey;
    delete config.skillSlots;
    delete config.activeProfileId;

    store.set("config", config);
    currentConfig = config;
  }
  // Migration 2: Single activeProfileId to multi-profile system
  else if (config.activeProfileId && !config.runningProfileIds) {
    console.log("Migrating to multi-profile execution system...");
    config.selectedProfileId = config.activeProfileId;
    config.runningProfileIds = [];
    delete config.activeProfileId;

    store.set("config", config);
    currentConfig = config;
  } else {
    currentConfig = config;
  }

  // Migration 3: Add overlay config if missing
  if (!currentConfig.overlay) {
    console.log("Migrating config: Adding overlay settings...");
    currentConfig.overlay = {
      enabled: true,
      position: { x: 10, y: 10 },
    };
    store.set("config", currentConfig);
  }

  // Migration 4: Add windowPosition if missing
  if (!currentConfig.windowPosition) {
    // Default to center-ish or let Electron decide (undefined)
  }

  // Migration 5: Add helltide settings if missing
  if (currentConfig.helltideEnabled === undefined) {
    console.log("Migrating config: Adding helltide settings...");
    currentConfig.helltideEnabled = false;
    currentConfig.worldBossEnabled = false;
    currentConfig.legionEnabled = false;
    store.set("config", currentConfig);
  }

  // Migration 6: Reset helltideOverlay position to default (right of profile layout)
  // This fixes issues where the overlay was positioned incorrectly
  const DEFAULT_OVERLAY_POSITION = { x: 610, y: 70 };
  if (
    !currentConfig.helltideOverlay ||
    (currentConfig.helltideOverlay.position?.x === 180 &&
      currentConfig.helltideOverlay.position?.y === 60) ||
    (currentConfig.helltideOverlay.position?.x === 1150 &&
      currentConfig.helltideOverlay.position?.y === 350) ||
    (currentConfig.helltideOverlay.position?.x === 10 &&
      currentConfig.helltideOverlay.position?.y === 10)
  ) {
    console.log(
      "Migrating config: Resetting helltideOverlay position to default..."
    );
    currentConfig.helltideOverlay = { position: DEFAULT_OVERLAY_POSITION };
    store.set("config", currentConfig);
  }

  return currentConfig;
}

// Get the currently selected profile for UI display
export function getSelectedProfile(config: AppConfig): MacroProfile {
  const selected = config.profiles.find(
    (p) => p.id === config.selectedProfileId
  );
  return selected || config.profiles[0];
}

// Check if a profile is currently running
export function isProfileRunning(
  config: AppConfig,
  profileId: string
): boolean {
  return config.runningProfileIds.includes(profileId);
}

// Legacy compatibility function (deprecated)
export function getActiveProfile(config: AppConfig): MacroProfile {
  return getSelectedProfile(config);
}

export function saveConfig(newConfig: AppConfig): boolean {
  try {
    store.set("config", newConfig);
    currentConfig = newConfig;
    return true;
  } catch (error) {
    console.error("Failed to save config:", error);
    return false;
  }
}

export function reloadConfig(): AppConfig {
  currentConfig = store.get("config");
  return currentConfig;
}
