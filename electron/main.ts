import { app, BrowserWindow, globalShortcut, nativeImage } from "electron";
console.log("🚀 [MAIN] Electron Main Process Starting...");
import * as path from "path";
import { registerIpcHandlers } from "./ipc-handlers";
import {
  startGlobalPoller,
  stopGlobalPoller,
  registerStopKeys,
  setStatusUpdateCallback,
  stopMacro,
  setAppFocused,
} from "./macro-engine";
import { getConfig } from "./config-manager";
import { createOverlayWindow, destroyOverlay } from "./overlay-window";
import { sendOverlayUpdate } from "./profile-state";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // Set App User Model ID for Windows Taskbar
  app.setAppUserModelId("com.vivecoding.d4helper");
  app.setName("D4 Helper");

  const config = getConfig();

  // Use absolute path based on process.cwd() for reliability in dev
  const iconPath =
    process.env.NODE_ENV === "development"
      ? path.join(process.cwd(), "public/icon.ico")
      : path.join(__dirname, "../../dist/icon.ico");

  console.log(`[MAIN] Icon Path: ${iconPath}`);
  const icon = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    title: "D4 Helper", // Set explicit title
    width: 1056,
    height: 750,
    minWidth: 1023,
    minHeight: 720,
    resizable: false, // User requested to remove maximize, implying fixed size or no resizing
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    frame: false, // Custom Title Bar 사용
    backgroundColor: "#1a1a1a",
    icon: icon, // Use nativeImage
    x: config.windowPosition?.x,
    y: config.windowPosition?.y,
  });

  // Save window position on move
  let moveTimeout: NodeJS.Timeout;
  mainWindow.on("move", () => {
    if (moveTimeout) clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        const [x, y] = mainWindow.getPosition();
        const newConfig = getConfig();
        newConfig.windowPosition = { x, y };
        require("./config-manager").saveConfig(newConfig);
        console.log(`[MAIN] Saved window position: ${x}, ${y}`);
      }
    }, 500); // Debounce 500ms
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    // mainWindow.webContents.openDevTools(); // Optional: Keep closed by default
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
    stopMacro("manual");
    stopGlobalPoller();
    globalShortcut.unregisterAll();
    destroyOverlay(); // Ensure overlay closes with main window
  });

  mainWindow.on("focus", () => {
    setAppFocused(true);
  });

  mainWindow.on("blur", () => {
    setAppFocused(false);
  });

  // Setup Status Update Callback
  setStatusUpdateCallback((status) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("status:update", status);
    }
  });

  // Initialize
  registerIpcHandlers();
  registerStopKeys(config.stopKeys);
  startGlobalPoller();

  // Create overlay window if enabled
  console.log("[MAIN] Overlay config:", config.overlay);
  if (config.overlay && config.overlay.enabled) {
    console.log("[MAIN] Creating overlay window...");
    createOverlayWindow();
    // Send initial status to overlay
    setTimeout(() => {
      sendOverlayUpdate();
    }, 1000); // Wait for window to load
  } else {
    console.log("[MAIN] Overlay disabled or not configured");
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", () => {
  // Cleanup
  stopGlobalPoller();
  globalShortcut.unregisterAll();
  destroyOverlay();
});
