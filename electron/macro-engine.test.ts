import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startMacro, stopMacro, currentStatus } from "./macro-engine";
import * as inputManager from "./input-manager";
import * as configManager from "./config-manager";

// Mock dependencies
vi.mock("./input-manager", () => ({
  sendKeyDown: vi.fn(),
  sendKeyUp: vi.fn(),
  clickMouse: vi.fn(),
  releaseAllKeys: vi.fn(),
  isKeyDown: vi.fn().mockReturnValue(false),
  VK_CODES: {},
}));

vi.mock("./config-manager", () => ({
  currentConfig: {
    version: "2.0.0",
    language: "ko",
    stopKeys: {},
    options: { randomDelay: false, randomDelayPercent: 0 },
    profiles: [
      {
        id: "default",
        name: "Default Profile",
        startStopKey: "F1",
        skillSlots: [
          { slotNumber: 1, key: "1", interval: 1000, enabled: true },
          { slotNumber: 2, key: "2", interval: 1000, enabled: false },
          { slotNumber: 3, key: "3", interval: 1000, enabled: false },
          { slotNumber: 4, key: "4", interval: 1000, enabled: false },
          { slotNumber: 5, key: "5", interval: 1000, enabled: false },
          { slotNumber: 6, key: "6", interval: 1000, enabled: false },
          { slotNumber: 7, key: "7", interval: 1000, enabled: false },
          { slotNumber: 8, key: "8", interval: 1000, enabled: false },
        ],
      },
    ],
    activeProfileId: "default",
  },
  getConfig: vi.fn(),
  getActiveProfile: vi.fn().mockImplementation((config) => {
    return config.profiles.find((p: any) => p.id === config.activeProfileId);
  }),
}));

describe("Macro Engine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Reset config
    const config = configManager.currentConfig as any;
    const profile = config.profiles[0];
    profile.skillSlots[0].enabled = true;
    profile.skillSlots[0].key = "1";
    profile.skillSlots[0].interval = 1000;
  });

  afterEach(() => {
    stopMacro("manual");
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("should start macro and update status", () => {
    startMacro();
    expect(currentStatus.state).toBe("running");
    expect(currentStatus.activeSlots).toContain(1);
  });

  it("should stop macro and update status", () => {
    startMacro();
    stopMacro();
    expect(currentStatus.state).toBe("stopped");
    expect(inputManager.releaseAllKeys).toHaveBeenCalled();
  });

  it("should trigger key press on interval", () => {
    startMacro();

    // Advance time by 1000ms (interval)
    vi.advanceTimersByTime(1000);

    // Wait for the poller to tick
    vi.advanceTimersByTime(20);

    expect(inputManager.sendKeyDown).toHaveBeenCalledWith("1");
  });

  it("should not trigger key if slot is disabled", () => {
    (configManager.currentConfig as any).profiles[0].skillSlots[0].enabled =
      false;
    startMacro();

    vi.advanceTimersByTime(1100);

    expect(inputManager.sendKeyDown).not.toHaveBeenCalled();
  });
});
