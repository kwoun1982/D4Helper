// Helltide Overlay window management
import { BrowserWindow } from "electron";
import * as path from "path";

let helltideOverlayWindow: BrowserWindow | null = null;
let moveTimer: NodeJS.Timeout;
let isInteractiveMode = false;

export function createHelltideOverlayWindow() {
  try {
    console.log("[HELLTIDE-OVERLAY] createHelltideOverlayWindow() called");

    if (helltideOverlayWindow) {
      return helltideOverlayWindow;
    }

    const { getConfig } = require("./config-manager");
    const config = getConfig();
    const constants = require("./const.json");
    // Default position: right side of the profile layout overlay
    const DEFAULT_POSITION = constants.helltideOverlay.defaultPosition;
    const { x, y } = config.helltideOverlay?.position || DEFAULT_POSITION;

    console.log(
      `[HELLTIDE-OVERLAY] Creating new BrowserWindow at ${x}, ${y}...`
    );
    helltideOverlayWindow = new BrowserWindow({
      width: 300,
      height: 200, // Smaller height for just 3 items
      x: x, // Use saved or default position
      y: y,
      transparent: true,
      backgroundColor: "#00000000",
      frame: false,
      hasShadow: false,
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

    console.log("[HELLTIDE-OVERLAY] Window created successfully");

    // Fix for Windows 11 transparency
    if (process.platform === "win32") {
      helltideOverlayWindow.setBackgroundMaterial("none");
    }

    helltideOverlayWindow.setAlwaysOnTop(true, "normal");
    helltideOverlayWindow.setIgnoreMouseEvents(true, { forward: true });

    if (process.env.NODE_ENV === "development") {
      const url = "http://localhost:5173/helltide.html";
      console.log("[HELLTIDE-OVERLAY] Loading URL:", url);
      helltideOverlayWindow.loadURL(url);
      helltideOverlayWindow.webContents.openDevTools({ mode: "detach" });
    } else {
      helltideOverlayWindow.loadFile(
        path.join(__dirname, "../../dist/helltide.html")
      );
    }

    helltideOverlayWindow.once("ready-to-show", () => {
      helltideOverlayWindow?.show();
    });

    helltideOverlayWindow.on("move", () => {
      if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
        const [newX, newY] = helltideOverlayWindow.getPosition();
        const { getConfig, saveConfig } = require("./config-manager");
        const currentConfig = getConfig();

        if (moveTimer) clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
          if (!currentConfig.helltideOverlay)
            currentConfig.helltideOverlay = {};
          currentConfig.helltideOverlay.position = { x: newX, y: newY };
          saveConfig(currentConfig);
          console.log(`[HELLTIDE-OVERLAY] Saved position: ${newX}, ${newY}`);
        }, 500);
      }
    });

    helltideOverlayWindow.on("closed", () => {
      helltideOverlayWindow = null;
    });

    return helltideOverlayWindow;
  } catch (error) {
    console.error("❌ [HELLTIDE-OVERLAY] Error creating window:", error);
    return null;
  }
}

export function setHelltideOverlayInteractive(interactive: boolean) {
  if (!helltideOverlayWindow || helltideOverlayWindow.isDestroyed()) return;

  if (interactive) {
    isInteractiveMode = true;
    helltideOverlayWindow.setIgnoreMouseEvents(false);
    helltideOverlayWindow.setFocusable(true);
    helltideOverlayWindow.webContents.send("overlay:interactive", true); // Reuse same event name for simplicity in frontend
  } else {
    isInteractiveMode = false;
    helltideOverlayWindow.setIgnoreMouseEvents(true, { forward: true });
    helltideOverlayWindow.setFocusable(false);
    helltideOverlayWindow.webContents.send("overlay:interactive", false);
  }
}

export function setHelltideOverlayFocus(focused: boolean) {
  if (!helltideOverlayWindow || helltideOverlayWindow.isDestroyed()) return;

  if (isInteractiveMode) return;

  if (focused) {
    helltideOverlayWindow.setIgnoreMouseEvents(false);
  } else {
    helltideOverlayWindow.setIgnoreMouseEvents(true, { forward: true });
  }
}

export function sendHelltideUpdateToOverlay(data: any) {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.webContents.send("helltide:update", data);
  }
}

export function sendHelltideStateChangeToOverlay(state: {
  feature: string;
  enabled: boolean;
}) {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.webContents.send("helltide:state-change", state);
  }
}

export function moveHelltideOverlay(deltaX: number, deltaY: number) {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    const [x, y] = helltideOverlayWindow.getPosition();
    helltideOverlayWindow.setPosition(x + deltaX, y + deltaY);
  }
}

export function showHelltideOverlay() {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.show();
  }
}

export function hideHelltideOverlay() {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.hide();
  }
}

export function resetHelltideOverlayPosition() {
  // Default position: right side of the profile layout overlay
  const constants = require("./const.json");
  const defaultPosition = constants.helltideOverlay.defaultPosition;

  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.setPosition(defaultPosition.x, defaultPosition.y);
  }

  // Save reset position to config
  const { getConfig, saveConfig } = require("./config-manager");
  const config = getConfig();
  if (!config.helltideOverlay) config.helltideOverlay = {};
  config.helltideOverlay.position = defaultPosition;
  saveConfig(config);

  console.log(
    `[HELLTIDE-OVERLAY] Position reset to default: ${defaultPosition.x}, ${defaultPosition.y}`
  );
}

export function destroyHelltideOverlay() {
  if (helltideOverlayWindow && !helltideOverlayWindow.isDestroyed()) {
    helltideOverlayWindow.close();
    helltideOverlayWindow = null;
  }
}
