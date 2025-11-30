# D4 Helper - Setup Guide

## Prerequisites

### 1. Install Node.js
- Download and install Node.js 18+ LTS from https://nodejs.org/
- Verify installation: `node --version` and `npm --version`

### 2. Install Windows Build Tools (Required for robotjs)

```bash
# Run PowerShell as Administrator
npm install --global windows-build-tools
```

Or install Visual Studio Build Tools manually:
- Download from https://visualstudio.microsoft.com/downloads/
- Install "Desktop development with C++" workload

## Installation Steps

### Step 1: Install Dependencies

```bash
cd D:\__SRC\Dia4Helper\dia4helper_claude
npm install
```

**Note**: If robotjs fails to install:
```bash
# Try with Python 2.7
npm install --global --production windows-build-tools --vs2015
npm install robotjs --build-from-source
```

### Step 2: Development Mode

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron (in another terminal)
npm run electron:dev
```

Or use the combined command:
```bash
npm run electron:dev
```

### Step 3: Build for Production

```bash
npm run electron:build
```

This will create:
- `release/D4 Helper Setup 2.1.0.exe` - Installer
- `release/D4 Helper 2.1.0.exe` - Portable version

## Project Structure

```
dia4helper_claude/
├── electron/
│   ├── main.ts              # Electron main process
│   └── preload.ts           # IPC bridge
├── src/
│   ├── components/
│   │   ├── ui/              # Custom UI components
│   │   ├── TitleBar.tsx
│   │   ├── MenuBar.tsx
│   │   ├── StartStopPanel.tsx
│   │   ├── StopKeysPanel.tsx
│   │   ├── SkillSlot.tsx
│   │   ├── SkillKeysGrid.tsx
│   │   └── SpecialKeyPanel.tsx
│   ├── i18n/
│   │   └── config.ts
│   ├── locales/
│   │   ├── ko/translation.json
│   │   ├── en/translation.json
│   │   ├── ja/translation.json
│   │   └── zh/translation.json
│   ├── styles/
│   │   └── diablo-theme.css
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Features Implemented

### Core Features
- ✅ 8 Skill slots with customizable keys and intervals
- ✅ F1 hotkey for Start/Stop
- ✅ Custom red slider for interval adjustment (0-2000ms)
- ✅ Stop Keys (C, K, F, Tab, M, T, Enter, /)
- ✅ Special Key (Hold to Pause)
- ✅ Configuration save/load
- ✅ Multi-language support (KO, EN, JA, ZH)

### UI Features
- ✅ Custom Diablo 4-themed dark UI
- ✅ Gold metal borders
- ✅ Gothic fonts (Cinzel + Noto Sans KR)
- ✅ Custom sliders with gold handles
- ✅ Custom toggle switches (red glow when ON)
- ✅ Frameless window with custom title bar
- ✅ Status indicator with pulse animation

## Usage

### 1. Setting Up Skills

1. Click on a skill slot's key input field
2. Press the desired key (1-8, Q, E, Space, etc.)
3. Adjust the interval using:
   - The red slider (0-2000ms)
   - Or type directly in the number input

### 2. Start/Stop Macro

- Press **F1** or click the Start button
- Press **F1** again or click Stop to stop
- Green pulsing dot = Running
- Red dot = Stopped

### 3. Stop Keys (Auto-Pause)

Toggle any Diablo 4 menu keys:
- 🎒 Inventory (C)
- ✕ Skills (K)
- 👤 Follower (F)
- 🗺️ Map (Tab)
- 🌍 World Map (M)
- 🌀 Town Portal (T)
- 💬 Chat (Enter)

When enabled, pressing these keys will pause the macro.

### 4. Special Key (Hold to Pause)

Set a key that pauses the macro while held down.
Useful for precise movement or targeting.

### 5. Language Selection

Click the language dropdown in the menu bar:
- 한국어 (Korean)
- English
- 日本語 (Japanese)
- 简体中文 (Simplified Chinese)

## Troubleshooting

### robotjs Installation Issues

**Error**: `node-gyp rebuild failed`

**Solution 1**: Install Python 2.7
```bash
npm install --global --production windows-build-tools
```

**Solution 2**: Use Node.js 16 LTS (robotjs has better compatibility)
```bash
nvm install 16
nvm use 16
npm install
```

**Solution 3**: Skip robotjs for testing (replace with mock)
```typescript
// In electron/main.ts
// Comment out: import robot from 'robotjs';
// Add: const robot = { keyTap: (key: string) => console.log('Key:', key) };
```

### Vite Build Issues

If Vite fails to build:
```bash
npm run build -- --force
```

### Electron Window Blank

Check the console (F12 in dev mode):
- Ensure all imports are correct
- Check for TypeScript errors
- Verify i18n is initialized

## Advanced Configuration

### Custom Hotkey

Edit `src/types/index.ts`:
```typescript
export const DEFAULT_CONFIG: AppConfig = {
  // ...
  startStopKey: 'F2', // Change from F1 to F2
  // ...
};
```

### Random Delay

Enable in code (UI not implemented yet):
```typescript
options: {
  randomDelay: true,
  randomDelayPercent: 10, // ±10% variance
}
```

### Custom Colors

Edit `src/styles/diablo-theme.css`:
```css
:root {
  --accent-red: #ff0000; /* Change red accent */
  --border-gold: #ffd700; /* Change gold border */
}
```

## Known Limitations

1. **robotjs** only works on the main display
2. Some keys (Tab, Enter) may not work as global shortcuts
3. Macro detection: This is a software-level tool, detectable by anti-cheat
4. Windows only (robotjs has limited macOS/Linux support)

## Development Notes

### Adding New Languages

1. Create `src/locales/[lang]/translation.json`
2. Add to `src/i18n/config.ts`:
```typescript
import newLangTranslation from '../locales/[lang]/translation.json';

resources: {
  // ...
  [lang]: { translation: newLangTranslation },
}
```

3. Add to language selector in `MenuBar.tsx`

### Debugging

- Press F12 in dev mode to open DevTools
- Check Electron logs in terminal
- Use `console.log` in main process (shows in terminal)
- Use `console.log` in renderer (shows in DevTools)

## License

MIT - Educational purposes only. Use at your own risk.

## Credits

- Built with Electron + React + TypeScript
- Diablo 4 theme inspired by the game UI
- Icons from Unicode/Emoji
