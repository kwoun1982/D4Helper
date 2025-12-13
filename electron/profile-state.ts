// Profile state management module
import { MacroProfile, MacroStatus } from "../src/types";

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

export function updateCurrentStatus() {
  const hasRunning = runningProfiles.size > 0;
  const allPaused =
    hasRunning &&
    Array.from(runningProfiles.values()).every((p) => p.state === "paused");

  currentStatus = {
    state: hasRunning ? (allPaused ? "paused" : "running") : "stopped",
    activeSlots: [],
    runningProfiles: Object.fromEntries(
      Array.from(runningProfiles.entries()).map(([id, state]) => [
        id,
        { state: state.state, startedAt: state.startedAt },
      ])
    ),
  };
  sendStatusUpdate();
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
