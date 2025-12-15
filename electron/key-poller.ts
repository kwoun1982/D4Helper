// Global key polling module
import { AppConfig, StopKeysConfig, STOP_KEY_MAPPING } from "../src/types";
import { VK_CODES, isKeyDown } from "./input-manager";
import { runningProfiles } from "./profile-state";
import { getConfig } from "./config-manager";

let globalPoller: NodeJS.Timeout | null = null;

// Key state tracking for edge detection
const previousKeyStates: Map<string, boolean> = new Map();
const previousStopKeyStates: Map<string, boolean> = new Map();

// Global Poller for all profiles' Start/Stop Keys
export function startGlobalPollerIfNeeded() {
  if (globalPoller) return; // Already running

  console.log("✅ [KEY-POLLER] Starting global key poller...");

  globalPoller = setInterval(() => {
    const config = getConfig(); // Get fresh config every time

    // Check each profile's start/stop key
    config.profiles.forEach((profile) => {
      const keyUpper = profile.startStopKey.toUpperCase();
      const vk = VK_CODES[keyUpper];

      if (!vk) {
        console.warn(
          `⚠️ [KEY-POLLER] No VK code for key: ${profile.startStopKey}`
        );
        return;
      }

      // Start/Stop logic RESTORED (Global Shortcuts disabled in main.ts)
      const isPressed = isKeyDown(profile.startStopKey);

      // Debug log for F1/F2 press
      if (isPressed) {
        // console.log(`[KEY-POLLER] Detected press for ${profile.startStopKey}`);
      }
      const isRunning = runningProfiles.has(profile.id);

      // Toggle on key press (detect rising edge)
      if (isPressed && !previousKeyStates.get(profile.id)) {
        console.log(
          `🔑 [KEY-POLLER] Key ${profile.startStopKey} pressed! Profile: ${
            profile.name
          }, VK: 0x${vk.toString(16)}`
        );

        const { startProfile, stopProfile } = require("./macro-controller");
        const { getAppFocused } = require("./profile-state");

        if (isRunning) {
          console.log(`⏹️ [KEY-POLLER] Stopping profile ${profile.name}`);
          stopProfile(profile.id, config);
        } else {
          // const appFocused = getAppFocused();
          console.log(`▶️ [KEY-POLLER] Starting profile ${profile.name}`);

          // if (!appFocused) {
          startProfile(profile.id, config);
          // } else {
          //   console.log(`⚠️ [KEY-POLLER] App is focused, not starting profile`);
          // }
        }
      }

      previousKeyStates.set(profile.id, isPressed);
    });

    // Check stop keys for all running profiles
    if (runningProfiles.size > 0) {
      // 1. Check ESC Key (Global Hard Stop)
      if (isKeyDown("ESCAPE")) {
        const { stopProfile } = require("./macro-controller");
        console.log(
          "⏹️ [GLOBAL-STOP] ESC pressed - Stopping all running profiles"
        );
        runningProfiles.forEach((_, profileId) => {
          stopProfile(profileId, config);
        });
        // Debounce to prevent multiple triggers
        previousStopKeyStates.set("ESCAPE", true);
      }

      // 2. Check Configured Stop Keys
      Object.entries(STOP_KEY_MAPPING).forEach(([configKey, keyName]) => {
        if (config.stopKeys[configKey as keyof StopKeysConfig]) {
          const vk = VK_CODES[keyName.toUpperCase()];
          if (!vk) return;

          const isPressed = isKeyDown(keyName);

          if (isPressed && !previousStopKeyStates.get(keyName)) {
            const { stopProfile } = require("./macro-controller");
            console.log(
              `⏹️ [STOP-KEY] ${keyName} pressed - Stopping all running profiles`
            );
            // Stop all running profiles
            runningProfiles.forEach((_, profileId) => {
              stopProfile(profileId, config);
            });
          }

          previousStopKeyStates.set(keyName, isPressed);
        }
      });
    }
  }, 100);
}

export function stopGlobalPoller() {
  if (globalPoller) {
    console.log("❌ [KEY-POLLER] Stopping global key poller...");
    clearInterval(globalPoller);
    globalPoller = null;
  }
}

export function startGlobalPoller() {
  startGlobalPollerIfNeeded();
}
