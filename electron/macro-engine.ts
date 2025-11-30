import { AppConfig, MacroStatus, StopKeysConfig, STOP_KEY_MAPPING } from '../src/types';
import { currentConfig, getConfig } from './config-manager';
import { sendKeyDown, sendKeyUp, clickMouse, releaseAllKeys, VK_CODES, isKeyDown } from './input-manager';

export let currentStatus: MacroStatus = { state: 'stopped', activeSlots: [] };
let statusUpdateCallback: ((status: MacroStatus) => void) | null = null;

const macroIntervals: Map<number, NodeJS.Timeout> = new Map();
const pendingKeyUps: Map<string, NodeJS.Timeout> = new Map(); // Local tracking for macro-initiated keys

// Helper to add random delay
function addRandomDelay(interval: number, percent: number): number {
  if (percent === 0) return interval;
  const variance = interval * (percent / 100);
  const random = Math.random() * variance * 2 - variance; // -variance to +variance
  return Math.floor(interval + random);
}

export function setStatusUpdateCallback(callback: (status: MacroStatus) => void) {
  statusUpdateCallback = callback;
}

let isAppFocused = false;

export function setAppFocused(focused: boolean) {
  isAppFocused = focused;
  console.log(`App focus changed: ${focused}`);
  // If app is focused and macro is running, maybe we should stop it?
  // User said "macro should not start", but stopping is safer to avoid typing in the app.
  // Let's just prevent START for now as per request.
}

function sendStatusUpdate() {
  if (statusUpdateCallback) {
    statusUpdateCallback(currentStatus);
  }
}

// 매크로 시작
export function startMacro() {
  // Zombie Timer Guard
  if (currentStatus.state === 'running' || macroIntervals.size > 0) {
    console.warn('Macro start requested but already running. Stopping first...');
    stopMacro('manual');
  }

  console.log('Starting macro...');
  const config = currentConfig;

  const slotTimers = new Map<number, { nextTime: number; interval: number; key: string }>();
  const startTime = Date.now();

  config.skillSlots.forEach((slot) => {
    if (slot.enabled && slot.key) {
      const interval = config.options.randomDelay
        ? addRandomDelay(slot.interval, config.options.randomDelayPercent)
        : slot.interval;

      console.log(`Setting up slot ${slot.slotNumber}: key=${slot.key}, interval=${interval}ms`);
      
      slotTimers.set(slot.slotNumber, {
        nextTime: startTime + interval,
        interval: interval,
        key: slot.key
      });
    }
  });

  const mainTimer = setInterval(() => {
    if (currentStatus.state === 'running') {
      const now = Date.now();
      
      slotTimers.forEach((timer, slotNumber) => {
        if (now >= timer.nextTime) {
          try {
            // console.log(`Pressing key: ${timer.key} (slot ${slotNumber})`);
            
            if (timer.key.startsWith('Mouse')) {
              clickMouse(timer.key);
            } else {
              // Press Key with duration
              sendKeyDown(timer.key);
              
              if (pendingKeyUps.has(timer.key)) {
                clearTimeout(pendingKeyUps.get(timer.key)!);
              }

              const timeout = setTimeout(() => {
                sendKeyUp(timer.key);
                pendingKeyUps.delete(timer.key);
              }, 50); 
              
              pendingKeyUps.set(timer.key, timeout);
            }
            
            timer.nextTime = now + timer.interval;
          } catch (error) {
            console.error(`Error pressing key ${timer.key}:`, error);
          }
        }
      });
    }
  }, 10);

  macroIntervals.set(0, mainTimer);
  
  currentStatus = { state: 'running', activeSlots: Array.from(slotTimers.keys()) };
  sendStatusUpdate();
}

// 매크로 정지
export function stopMacro(reason: string = 'manual') {
  console.log(`Stopping macro (reason: ${reason})...`);

  // Clear all intervals
  macroIntervals.forEach((timer) => clearInterval(timer));
  macroIntervals.clear();

  // Clear pending key up timeouts
  pendingKeyUps.forEach((timeout) => clearTimeout(timeout));
  pendingKeyUps.clear();

  // Force release all keys
  releaseAllKeys();

  // Fail-Safe: Explicitly release configured keys
  if (currentConfig && currentConfig.skillSlots) {
    currentConfig.skillSlots.forEach(slot => {
      if (slot.key && !slot.key.startsWith('Mouse')) {
        sendKeyUp(slot.key);
      }
    });
  }

  currentStatus = { state: 'stopped', activeSlots: [] };
  sendStatusUpdate();
}

// 일시정지
export function pauseMacro(reason: 'manual' | 'stopKey' | 'specialKey') {
  if (currentStatus.state !== 'running') return;

  console.log(`Pausing macro (reason: ${reason})...`);
  currentStatus = { ...currentStatus, state: 'paused', pauseReason: reason };
  
  // Release keys when paused
  releaseAllKeys();
  
  sendStatusUpdate();
}

// 재개
export function resumeMacro() {
  if (currentStatus.state !== 'paused') return;

  console.log('Resuming macro...');
  currentStatus = { ...currentStatus, state: 'running', pauseReason: undefined };
  sendStatusUpdate();
}

// Stop Keys 등록
// Stop Keys 등록 (Deprecated - Polling is used instead)
export function registerStopKeys(stopKeys: StopKeysConfig) {
  // No-op: Stop keys are now handled by the global poller
}

// Global Poller for Start/Stop Key (F1) and Stop Keys
let globalPoller: NodeJS.Timeout | null = null;
let wasStopKeyDown = false;
let lastToggleTime = 0;
const stopKeyStates = new Map<string, boolean>();
let lastStopKeyToggleTime = 0;

export function startGlobalPoller() {
  if (globalPoller) clearInterval(globalPoller);

  const pollInterval = 50;
  
  globalPoller = setInterval(() => {
    const config = getConfig();
    const stopKeyVk = VK_CODES[config.startStopKey.toUpperCase()];
    
    if (stopKeyVk) {
      const isStopKeyDown = isKeyDown(config.startStopKey);

      // Edge Triggering: Rising Edge
      if (isStopKeyDown && !wasStopKeyDown) {
        const now = Date.now();
        if (now - lastToggleTime > 500) { // Debounce
          console.log('Start/Stop key pressed (Edge Triggered)');
          lastToggleTime = now;

          if (currentStatus.state === 'running') {
            stopMacro('manual');
          } else if (currentStatus.state === 'stopped') {
            if (!isAppFocused) {
              startMacro();
            } else {
              console.log('Macro start blocked because app is focused');
            }
          } else if (currentStatus.state === 'paused') {
            if (!isAppFocused) {
              resumeMacro();
            }
          }
        }
      }
      
      wasStopKeyDown = isStopKeyDown;
    }

    // Stop Keys Polling
    Object.entries(config.stopKeys).forEach(([key, enabled]) => {
      if (enabled) {
        const keyName = STOP_KEY_MAPPING[key as keyof StopKeysConfig];
        const isDown = isKeyDown(keyName);
        const wasDown = stopKeyStates.get(key) || false;

        if (isDown && !wasDown) {
           const now = Date.now();
           if (now - lastStopKeyToggleTime > 500) {
             lastStopKeyToggleTime = now;
             
             if (currentStatus.state === 'running') {
                pauseMacro('stopKey');
             } else if (currentStatus.state === 'paused' && currentStatus.pauseReason === 'stopKey') {
                resumeMacro();
             }
           }
        }
        stopKeyStates.set(key, isDown);
      }
    });

  }, pollInterval);
}

export function stopGlobalPoller() {
  if (globalPoller) {
    clearInterval(globalPoller);
    globalPoller = null;
  }
}
