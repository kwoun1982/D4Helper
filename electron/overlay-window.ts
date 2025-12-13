// Overlay window management for game status display
import { BrowserWindow } from "electron";
import * as path from "path";

let overlayWindow: BrowserWindow | null = null;

export function createOverlayWindow() {
  try {
    console.log("[OVERLAY] createOverlayWindow() called");

    if (overlayWindow) {
      console.log("[OVERLAY] Overlay window already exists");
      return overlayWindow;
    }

    const { getConfig } = require("./config-manager");
    const config = getConfig();
    const { x, y } = config.overlay?.position || { x: 10, y: 10 };

    console.log(`[OVERLAY] Creating new BrowserWindow at ${x}, ${y}...`);
    overlayWindow = new BrowserWindow({
      width: 300,
      height: 400,
      x: x,
      y: y,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      focusable: false,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: false,
        contextIsolation: true,
        backgroundThrottling: false,
      },
    });

    console.log("[OVERLAY] BrowserWindow created, setting always on top...");
    // Set to screen-saver level for maximum z-index
    overlayWindow.setAlwaysOnTop(true, "screen-saver");

    console.log("[OVERLAY] Setting ignore mouse events...");
    // Enable click-through
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });

    console.log("[OVERLAY] Loading HTML...");
    // Load overlay HTML
    if (process.env.NODE_ENV === "development") {
      const url = "http://localhost:5173/overlay.html";
      console.log("[OVERLAY] Loading URL:", url);
      overlayWindow.loadURL(url);
    } else {
      overlayWindow.loadFile(path.join(__dirname, "../../dist/overlay.html"));
    }

    overlayWindow.on("move", () => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        const [newX, newY] = overlayWindow.getPosition();
        const { getConfig, saveConfig } = require("./config-manager");
        const currentConfig = getConfig();

        // Debounce saving if needed, but for now direct save is okay for overlay (less frequent moves)
        // Or better, use a timeout like main window
        if (moveTimer) clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
          currentConfig.overlay.position = { x: newX, y: newY };
          saveConfig(currentConfig);
          console.log(`[OVERLAY] Saved position: ${newX}, ${newY}`);
        }, 500);
      }
    });

    overlayWindow.on("closed", () => {
      console.log("[OVERLAY] Overlay window closed");
      overlayWindow = null;
    });

    console.log("✅ [OVERLAY] Overlay window created successfully");

    return overlayWindow;
  } catch (error) {
    console.error("❌ [OVERLAY] Error creating overlay window:", error);
    return null;
  }
}

let moveTimer: NodeJS.Timeout;

export function setOverlayInteractive(interactive: boolean) {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;

  if (interactive) {
    console.log("[OVERLAY] Enabling interaction (Edit Mode)");
    overlayWindow.setIgnoreMouseEvents(false);
    overlayWindow.setFocusable(true); // Allow focus to drag
    overlayWindow.webContents.send("overlay:interactive", true);
    // Add a background or border via IPC to renderer?
    // Renderer will handle visual changes based on "overlay:interactive" event
  } else {
    console.log("[OVERLAY] Disabling interaction (Locked Mode)");
    overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    overlayWindow.setFocusable(false);
    overlayWindow.webContents.send("overlay:interactive", false);
    // Ensure focus goes back to game or main app?
    overlayWindow.blur();
  }
}

export function updateOverlayStatus(
  runningProfiles: Array<{
    profileName: string;
    startStopKey: string;
    state: "running" | "paused" | "stopped";
  }>
) {
  console.log(
    "[OVERLAY] updateOverlayStatus called with:",
    JSON.stringify(runningProfiles)
  );
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    console.log("[OVERLAY] Sending overlay:update to renderer");
    overlayWindow.webContents.send("overlay:update", runningProfiles);
  } else {
    console.log("[OVERLAY] Window destroyed or null, cannot send update");
  }
}

export function showOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
  }
}

export function hideOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }
}

export function destroyOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
    overlayWindow = null;
  }
}

export function resetOverlayPosition() {
  // Always update config first
  const { getConfig, saveConfig } = require("./config-manager");
  const currentConfig = getConfig();
  if (!currentConfig.overlay) {
    currentConfig.overlay = {};
  }
  currentConfig.overlay.position = { x: 20, y: 20 };
  saveConfig(currentConfig);
  console.log("[OVERLAY] Config reset to (20, 20)");

  if (overlayWindow && !overlayWindow.isDestroyed()) {
    console.log("[OVERLAY] Resetting existing window position");
    overlayWindow.setPosition(20, 20);
    overlayWindow.show(); // Ensure it's visible
    // If we are in interactive mode, ensure it's focusable?
    // The renderer calls this when interactive mode is ON, so we should probably ensure it's interactive.
    // But setOverlayInteractive(true) should have been called already.
  } else {
    console.log(
      "[OVERLAY] Window not found, creating new one at default position"
    );
    createOverlayWindow();
  }
}
