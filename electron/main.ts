import { app, BrowserWindow, globalShortcut } from "electron";
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

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
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
    icon: path.join(
      __dirname,
      process.env.NODE_ENV === "development"
        ? "../../public/icon.ico"
        : "../../dist/icon.ico"
    ),
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
  const config = getConfig();
  registerIpcHandlers();
  registerStopKeys(config.stopKeys);
  startGlobalPoller();
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
});
