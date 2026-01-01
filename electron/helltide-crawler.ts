import { BrowserWindow } from "electron";
import { EventTimersData } from "../src/types";

let crawlerWindow: BrowserWindow | null = null;
let updateInterval: NodeJS.Timeout | null = null;
let lastData: EventTimersData | null = null;
let dataCallback: ((data: EventTimersData) => void) | null = null;
let isPageReady = false;

export function startHelltideCrawler(
  onDataUpdate: (data: EventTimersData) => void
) {
  if (crawlerWindow) return;

  console.log("[CRAWLER] Starting Helltide crawler...");
  dataCallback = onDataUpdate;

  // Create hidden window for web scraping
  crawlerWindow = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Load helltides.com
  crawlerWindow.loadURL("https://helltides.com/");

  crawlerWindow.webContents.on("did-finish-load", () => {
    console.log("[CRAWLER] Page loaded, waiting for JavaScript to render...");
    // Wait for JS content to render
    setTimeout(() => {
      isPageReady = true;
      extractData();
    }, 3000);
  });

  crawlerWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription) => {
      console.error(
        `[CRAWLER] Failed to load page: ${errorCode} - ${errorDescription}`
      );
      sendFallbackData();
    }
  );

  // Helper: Get random interval between 5-10 minutes (in ms)
  function getRandomInterval(): number {
    const minMinutes = 5;
    const maxMinutes = 10;
    const randomMinutes =
      Math.random() * (maxMinutes - minMinutes) + minMinutes;
    return Math.floor(randomMinutes * 60 * 1000);
  }

  // Schedule next update with random interval (5-10 minutes)
  function scheduleNextUpdate() {
    if (!crawlerWindow || crawlerWindow.isDestroyed()) return;

    const interval = getRandomInterval();
    console.log(
      `[CRAWLER] Next update in ${Math.round(interval / 1000 / 60)} minutes`
    );

    updateInterval = setTimeout(() => {
      if (crawlerWindow && !crawlerWindow.isDestroyed() && isPageReady) {
        extractData();
      }
      scheduleNextUpdate(); // Schedule next update
    }, interval);
  }

  // Start the random interval updates after initial data extraction
  setTimeout(() => {
    scheduleNextUpdate();
  }, 5000); // Wait 5 seconds after initial load before starting schedule
}

async function extractData() {
  if (!crawlerWindow || crawlerWindow.isDestroyed()) return;

  try {
    const result = await crawlerWindow.webContents.executeJavaScript(`
      (function() {
        const data = {
          helltide: { status: 'Next in', time: '--:--' },
          worldBoss: { name: 'Unknown', time: '--:--' },
          legion: { time: '--:--' }
        };
        
        // Helper: Parse time from text like "1 hour, 34 minutes, 38 seconds" or "34 minutes, 38 seconds"
        function parseMinutesSeconds(text) {
          if (!text) return null;
          
          // Pattern: "X hour(s), Y minutes, Z seconds" or "Y minutes, Z seconds"
          const hourMatch = text.match(/(\\d+)\\s*hours?/i);
          const minMatch = text.match(/(\\d+)\\s*minutes?/i);
          const secMatch = text.match(/(\\d+)\\s*seconds?/i);
          
          const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
          const mins = minMatch ? parseInt(minMatch[1]) : 0;
          const secs = secMatch ? parseInt(secMatch[1]) : 0;
          
          // Convert hours to minutes for display
          const totalMins = hours * 60 + mins;
          
          if (totalMins > 0 || secs > 0) {
            return String(totalMins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
          }
          return null;
        }
        
        // Helper: Parse short format "Xm Ys"
        function parseShortFormat(text) {
          if (!text) return null;
          const match = text.match(/(\\d+)m\\s*(\\d+)s/i);
          if (match) {
            const mins = parseInt(match[1]) || 0;
            const secs = parseInt(match[2]) || 0;
            return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
          }
          return null;
        }
        
        const bodyText = document.body.innerText;
        
        // ===== HELLTIDE =====
        // Look for "Time remaining" followed by time (Active helltide)
        // OR "Starts in" followed by time (Upcoming helltide)
        const helltideActiveMatch = bodyText.match(/Time remaining.*?((?:\\d+\\s*hours?,?\\s*)?\\d+\\s*minutes?,?\\s*\\d+\\s*seconds?)/is);
        const helltideUpcomingMatch = bodyText.match(/Starts in.*?((?:\\d+\\s*hours?,?\\s*)?\\d+\\s*minutes?,?\\s*\\d+\\s*seconds?)/is);
        
        if (helltideActiveMatch) {
          data.helltide.status = 'Active';
          data.helltide.time = parseMinutesSeconds(helltideActiveMatch[1]) || '--:--';
        } else if (helltideUpcomingMatch) {
          data.helltide.status = 'Next in';
          data.helltide.time = parseMinutesSeconds(helltideUpcomingMatch[1]) || '--:--';
        }
        
        // ===== WORLD BOSS =====
        // Look for boss names followed by "Spawns In" and time (now includes Azmodan and hours)
        const bossPatterns = [
          /(Avarice|Ashava|Wanderer|Azmodan).*?Spawns In.*?((?:\\d+\\s*hours?,?\\s*)?\\d+\\s*minutes?,?\\s*\\d+\\s*seconds?)/is,
          /(Avarice|Ashava|Wanderer|Azmodan).*?((?:\\d+\\s*hours?,?\\s*)?\\d+\\s*minutes?,?\\s*\\d+\\s*seconds?)/is
        ];
        
        for (const pattern of bossPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            // Extract boss name (first capture group)
            data.worldBoss.name = match[1];
            // Extract time (second capture group)
            data.worldBoss.time = parseMinutesSeconds(match[2]) || '--:--';
            break;
          }
        }
        
        // ===== LEGION =====
        // Look for Legion followed by short time format "Xm Ys"
        const legionPatterns = [
          /Legion[^\\d]*(\\d+m\\s*\\d+s)/is,
          /Upcoming Events.*?Legion[^\\d]*(\\d+m\\s*\\d+s)/is,
          /Legion.*?(\\d+\\s*minutes?,?\\s*\\d+\\s*seconds?)/is
        ];
        
        for (const pattern of legionPatterns) {
          const match = bodyText.match(pattern);
          if (match && match[1]) {
            const shortTime = parseShortFormat(match[1]);
            const longTime = parseMinutesSeconds(match[1]);
            data.legion.time = shortTime || longTime || '--:--';
            break;
          }
        }
        
        console.log('[CRAWLER] Helltide:', data.helltide);
        console.log('[CRAWLER] WorldBoss:', data.worldBoss);
        console.log('[CRAWLER] Legion:', data.legion);
        
        return data;
      })();
    `);

    if (result && dataCallback) {
      console.log("[CRAWLER] Extracted data:", JSON.stringify(result));
      lastData = result;
      dataCallback(result);
    }
  } catch (error) {
    console.error("[CRAWLER] Error:", error);
    sendFallbackData();
  }
}

function sendFallbackData() {
  const now = new Date();
  const mockData: EventTimersData = {
    helltide: {
      status: "Next in",
      time: `${String(55 - (now.getMinutes() % 60)).padStart(2, "0")}:${String(
        59 - now.getSeconds()
      ).padStart(2, "0")}`,
    },
    worldBoss: {
      name: "Unknown",
      time: `${String(20 + Math.floor(now.getMinutes() / 10)).padStart(
        2,
        "0"
      )}:${String(now.getSeconds()).padStart(2, "0")}`,
    },
    legion: {
      time: `${String(6 + (now.getMinutes() % 10)).padStart(2, "0")}:${String(
        59 - now.getSeconds()
      ).padStart(2, "0")}`,
    },
  };

  lastData = mockData;
  if (dataCallback) {
    dataCallback(mockData);
  }
}

export function stopHelltideCrawler() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (crawlerWindow && !crawlerWindow.isDestroyed()) {
    crawlerWindow.destroy();
    crawlerWindow = null;
  }
  isPageReady = false;
  dataCallback = null;
  console.log("[CRAWLER] Stopped.");
}

export function getHelltideData(): EventTimersData | null {
  return lastData;
}
