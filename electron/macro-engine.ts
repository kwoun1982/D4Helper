// Main macro engine - coordinates all modules
import { AppConfig, StopKeysConfig } from "../src/types";
import { getConfig, getSelectedProfile } from "./config-manager";

// Re-export from modules
export {
  currentStatus,
  setStatusUpdateCallback,
  setAppFocused,
  getProfileState,
} from "./profile-state";

export {
  startProfile,
  stopProfile,
  pauseProfile,
  resumeProfile,
  stopAllProfiles,
} from "./macro-controller";

export { startGlobalPoller, stopGlobalPoller } from "./key-poller";

// Legacy compatibility functions
export function startMacro() {
  const config = getConfig();
  const selectedProfile = getSelectedProfile(config);
  const { startProfile } = require("./macro-controller");
  startProfile(selectedProfile.id, config);
}

export function stopMacro(reason: string = "manual") {
  const config = getConfig();
  const selectedProfile = getSelectedProfile(config);
  const { stopProfile } = require("./macro-controller");
  stopProfile(selectedProfile.id, config);
}

export function pauseMacro(reason: "manual" | "stopKey" | "specialKey") {
  const config = getConfig();
  const { pauseProfile } = require("./macro-controller");
  const { runningProfiles } = require("./profile-state");

  // Pause all running profiles
  runningProfiles.forEach((_: any, profileId: string) => {
    pauseProfile(profileId, config);
  });
}

export function resumeMacro() {
  const { resumeProfile } = require("./macro-controller");
  const { runningProfiles } = require("./profile-state");

  // Resume all paused profiles
  runningProfiles.forEach((state: any, profileId: string) => {
    if (state.state === "paused") {
      resumeProfile(profileId);
    }
  });
}

// Deprecated - no-op
export function registerStopKeys(stopKeys: StopKeysConfig) {
  // No-op
}
