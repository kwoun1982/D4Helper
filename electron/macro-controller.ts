// Macro control functions module
import { AppConfig, SkillSlotConfig } from "../src/types";
import { sendKeyDown, sendKeyUp, clickMouse } from "./input-manager";
import {
  ProfileState,
  runningProfiles,
  updateCurrentStatus,
  addRandomDelay,
} from "./profile-state";
import { startGlobalPollerIfNeeded, stopGlobalPoller } from "./key-poller";

// Start a specific profile
export function startProfile(profileId: string, config: AppConfig) {
  const profile = config.profiles.find((p) => p.id === profileId);

  if (!profile) {
    console.error(`Profile ${profileId} not found`);
    return;
  }

  // Check if already running
  if (runningProfiles.has(profileId)) {
    console.warn(`Profile ${profileId} is already running`);
    return;
  }

  // Check max profiles limit (5)
  if (runningProfiles.size >= 5) {
    console.error("Maximum 5 profiles can run simultaneously");
    return;
  }

  console.log(`Starting profile: ${profile.name} (${profileId})`);

  const profileState: ProfileState = {
    intervals: new Map(),
    slotTimers: new Map(),
    pendingKeyUps: new Map(),
    state: "running",
    startedAt: Date.now(),
  };

  const startTime = Date.now();

  profile.skillSlots.forEach((slot) => {
    if (slot.enabled && slot.key) {
      const interval = config.options.randomDelay
        ? addRandomDelay(slot.interval, config.options.randomDelayPercent)
        : slot.interval;

      console.log(
        `[${profile.name}] Setting up slot ${slot.slotNumber}: key=${slot.key}, interval=${interval}ms`
      );

      profileState.slotTimers.set(slot.slotNumber, {
        nextTime: startTime + interval,
        interval: interval,
        key: slot.key,
      });
    }
  });

  // Main timer for this profile
  const mainTimer = setInterval(() => {
    const state = runningProfiles.get(profileId);
    if (!state || state.state !== "running") return;

    const now = Date.now();

    state.slotTimers.forEach((timer, slotNumber) => {
      if (now >= timer.nextTime) {
        try {
          if (timer.key.startsWith("Mouse")) {
            clickMouse(timer.key);
          } else {
            sendKeyDown(timer.key);

            if (state.pendingKeyUps.has(timer.key)) {
              clearTimeout(state.pendingKeyUps.get(timer.key)!);
            }

            const timeout = setTimeout(() => {
              sendKeyUp(timer.key);
              state.pendingKeyUps.delete(timer.key);
            }, 50);

            state.pendingKeyUps.set(timer.key, timeout);
          }

          timer.nextTime = now + timer.interval;
        } catch (error) {
          console.error(
            `[${profile.name}] Error pressing key ${timer.key}:`,
            error
          );
        }
      }
    });
  }, 10);

  profileState.intervals.set(0, mainTimer);
  runningProfiles.set(profileId, profileState);

  updateCurrentStatus();
  startGlobalPollerIfNeeded();
}

// Stop a specific profile
export function stopProfile(profileId: string, config: AppConfig) {
  const profileState = runningProfiles.get(profileId);
  if (!profileState) {
    console.warn(`Profile ${profileId} is not running`);
    return;
  }

  const profile = config.profiles.find((p) => p.id === profileId);
  console.log(`Stopping profile: ${profile?.name || profileId}`);

  // Clear all intervals
  profileState.intervals.forEach((timer) => clearInterval(timer));
  profileState.intervals.clear();

  // Clear pending key ups
  profileState.pendingKeyUps.forEach((timeout) => clearTimeout(timeout));
  profileState.pendingKeyUps.clear();

  // Release keys from this profile
  if (profile) {
    profile.skillSlots.forEach((slot) => {
      if (slot.key && !slot.key.startsWith("Mouse")) {
        sendKeyUp(slot.key);
      }
    });
  }

  runningProfiles.delete(profileId);
  updateCurrentStatus();

  // Don't stop global poller - keep it running so F1 can restart profiles
  // if (runningProfiles.size === 0) {
  //   stopGlobalPoller();
  // }
}

// Pause a specific profile
export function pauseProfile(profileId: string, config: AppConfig) {
  const profileState = runningProfiles.get(profileId);
  if (!profileState || profileState.state !== "running") return;

  console.log(`Pausing profile: ${profileId}`);
  profileState.state = "paused";

  // Release keys
  const profile = config.profiles.find((p) => p.id === profileId);
  if (profile) {
    profile.skillSlots.forEach((slot) => {
      if (slot.key && !slot.key.startsWith("Mouse")) {
        sendKeyUp(slot.key);
      }
    });
  }

  updateCurrentStatus();
}

// Resume a specific profile
export function resumeProfile(profileId: string) {
  const profileState = runningProfiles.get(profileId);
  if (!profileState || profileState.state !== "paused") return;

  console.log(`Resuming profile: ${profileId}`);
  profileState.state = "running";
  updateCurrentStatus();
}

// Stop all profiles
export function stopAllProfiles(config: AppConfig) {
  console.log("Stopping all profiles...");
  const profileIds = Array.from(runningProfiles.keys());
  profileIds.forEach((id) => stopProfile(id, config));
}
