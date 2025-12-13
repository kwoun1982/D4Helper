// Profile state management module
import { MacroProfile, MacroStatus, AppConfig } from "../src/types";
import { updateOverlayStatus } from "./overlay-window";

console.log("⚠️ [PROFILE-STATE] Module Loaded! ID:", Math.random());

// Per-profile state tracking
export interface ProfileState {
  intervals: Map<number, NodeJS.Timeout>; // slot number -> interval
  slotTimers: Map<number, { nextTime: number; interval: number; key: string }>;
  pendingKeyUps: Map<string, NodeJS.Timeout>;
  state: "running" | "paused";
  startedAt: number;
}

// Global state
export const runningProfiles: Map<string, ProfileState> = new Map();

export let currentStatus: MacroStatus = {
  state: "stopped",
  activeSlots: [],
  runningProfiles: {},
};

let statusUpdateCallback: ((status: MacroStatus) => void) | null = null;

export function setStatusUpdateCallback(
  callback: (status: MacroStatus) => void
) {
  statusUpdateCallback = callback;
}

export function sendStatusUpdate() {
  if (statusUpdateCallback) {
    statusUpdateCallback(currentStatus);
  }
}

export function updateCurrentStatus(
  profilesMap: Map<string, ProfileState> = runningProfiles
) {
  console.log(
    `[PROFILE-STATE] updateCurrentStatus called. runningProfiles size: ${profilesMap.size}`
  );
  const hasRunning = profilesMap.size > 0;
  const allPaused =
    hasRunning &&
    Array.from(profilesMap.values()).every((p) => p.state === "paused");

  currentStatus = {
    state: hasRunning ? (allPaused ? "paused" : "running") : "stopped",
    activeSlots: [],
    runningProfiles: Object.fromEntries(
      Array.from(profilesMap.entries()).map(([id, state]) => [
        id,
        { state: state.state, startedAt: state.startedAt },
      ])
    ),
  };
  sendStatusUpdate();
  sendOverlayUpdate(profilesMap);
}

// Send overlay update with running profiles
export function sendOverlayUpdate(
  profilesMap: Map<string, ProfileState> = runningProfiles
) {
  const { getConfig } = require("./config-manager");
  const config: AppConfig = getConfig();

  const allProfiles = config.profiles.map((profile) => {
    const runningState = profilesMap.get(profile.id);
    return {
      profileName: profile.name,
      startStopKey: profile.startStopKey,
      state: runningState ? runningState.state : ("stopped" as const),
    };
  });

  updateOverlayStatus(allProfiles);
}

// Helper to add random delay
export function addRandomDelay(interval: number, percent: number): number {
  if (percent === 0) return interval;
  const variance = interval * (percent / 100);
  const random = Math.random() * variance * 2 - variance;
  return Math.floor(interval + random);
}

let isAppFocused = false;

export function setAppFocused(focused: boolean) {
  isAppFocused = focused;
  console.log(`App focus changed: ${focused}`);
}

export function getAppFocused(): boolean {
  return isAppFocused;
}

export function getProfileState(
  profileId: string
): "running" | "paused" | "stopped" {
  const state = runningProfiles.get(profileId);
  if (!state) return "stopped";
  return state.state;
}
