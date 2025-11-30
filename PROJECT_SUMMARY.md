# D4 Helper - Project Summary

## 🎮 Project Overview

**D4 Helper - Sanctuary Edition** is a multi-language Electron desktop application that automates skill casting for Diablo 4. It features a custom Diablo-themed UI with support for 8 skill slots, configurable intervals, and intelligent pause mechanisms.

## 📦 What's Been Created

### Core Application Files

#### 1. **Electron Backend** (`electron/`)
- `main.ts` - Main process with macro logic, IPC handlers, and hotkey management
- `preload.ts` - Secure IPC bridge between main and renderer processes

#### 2. **React Frontend** (`src/`)

**Main Components:**
- `App.tsx` - Root component with state management
- `main.tsx` - React entry point with i18n initialization

**UI Components:**
- `TitleBar.tsx` - Custom frameless window title bar with controls
- `MenuBar.tsx` - File menu and language selector
- `StartStopPanel.tsx` - Macro start/stop controls with status indicator
- `StopKeysPanel.tsx` - Toggle list for Diablo UI keys (C, K, F, Tab, etc.)
- `SkillKeysGrid.tsx` - 2x4 grid layout for 8 skill slots
- `SkillSlot.tsx` - Individual skill slot with key input and interval slider
- `SpecialKeyPanel.tsx` - Hold-to-pause key configuration

**Custom UI Components:**
- `DiabloButton.tsx` - Styled button with glow effects
- `DiabloSlider.tsx` - Red gradient slider with gold handle
- `DiabloToggle.tsx` - Circular toggle with red glow when active
- `DiabloInput.tsx` - Themed text/number input

#### 3. **Internationalization** (`src/i18n/`, `src/locales/`)
- `config.ts` - i18next configuration
- `ko/translation.json` - Korean translations
- `en/translation.json` - English translations
- `ja/translation.json` - Japanese translations
- `zh/translation.json` - Simplified Chinese translations

#### 4. **Type Definitions** (`src/types/`)
- `index.ts` - TypeScript interfaces and constants
  - `SkillSlotConfig` - Skill slot configuration
  - `StopKeysConfig` - Stop keys configuration
  - `SpecialKeyConfig` - Special key configuration
  - `AppConfig` - Complete app configuration
  - `MacroStatus` - Runtime status tracking
  - `STOP_KEY_MAPPING` - Diablo key mappings

#### 5. **Styling** (`src/styles/`, `*.css`)
- `diablo-theme.css` - Global Diablo 4 theme with CSS variables
- Component-specific CSS files for each component

#### 6. **Configuration Files**
- `package.json` - Dependencies and build scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite bundler configuration
- `index.html` - HTML entry point

## 🎨 Design System

### Color Palette
```css
Main Background:    #0a0a0a (Almost black)
Panel Background:   #1a0808 (Dark red)
Border Gold:        #8b7355 (Bronze/Gold)
Accent Red:         #8b0000 (Diablo red)
Text Primary:       #e8dcc8 (Cream/Beige)
Text Highlight:     #ffd700 (Gold)
```

### Typography
- **Primary Font**: Cinzel (Gothic/Medieval)
- **Korean Support**: Noto Sans KR
- **Monospace**: For key displays

### UI Components Style
- **Buttons**: Red gradient with gold borders, glow on hover
- **Sliders**: Red fill with gold circular handle
- **Toggles**: Circular with red glow when active
- **Panels**: Dark red background with border glow

## 🔧 Technical Architecture

### Data Flow
```
User Input → React Component → App State → IPC → Electron Main → robotjs → Windows
                                    ↓
                              electron-store
                              (Persistent Config)
```

### IPC Channels
- `macro:start` - Start the macro
- `macro:stop` - Stop the macro
- `macro:pause` - Pause with reason
- `macro:resume` - Resume macro
- `config:save` - Save configuration
- `config:load` - Load configuration
- `status:update` - Status updates (Main → Renderer)
- `window:minimize/maximize/close` - Window controls

### State Management
- **App Config**: Stored in React state + electron-store
- **Macro Status**: Updated via IPC from main process
- **Language**: Managed by i18next + React state

## 🎯 Key Features

### 1. **8 Skill Slots**
- Configurable keys (1-8, Q, E, Space, etc.)
- Interval range: 0-5000ms
- Visual slider (0-2000ms for quick access)
- Enable/disable individual slots

### 2. **Start/Stop Control**
- F1 hotkey (global shortcut)
- Visual status indicator with pulse animation
- States: Running, Stopped, Paused

### 3. **Stop Keys (Auto-Pause)**
When enabled, pressing these keys pauses the macro:
- Inventory (C)
- Skills (K)
- Follower (F)
- Map (Tab)
- World Map (M)
- Town Portal (T)
- Chat (Enter)
- Whisper (/)

### 4. **Special Key (Hold to Pause)**
- Set a key that pauses while held
- Useful for precise targeting

### 5. **Multi-Language**
- Korean (기본)
- English
- Japanese (日本語)
- Simplified Chinese (简体中文)

### 6. **Configuration Persistence**
- Auto-save using electron-store
- JSON-based configuration
- Load previous settings on startup

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run electron:dev
```

### Build
```bash
npm run electron:build
```

## 📁 File Structure Overview

```
dia4helper_claude/
├── electron/                    # Electron backend
│   ├── main.ts                 # Main process (macro logic)
│   └── preload.ts              # IPC bridge
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── TitleBar.tsx
│   │   ├── MenuBar.tsx
│   │   ├── StartStopPanel.tsx
│   │   ├── StopKeysPanel.tsx
│   │   ├── SkillSlot.tsx
│   │   ├── SkillKeysGrid.tsx
│   │   └── SpecialKeyPanel.tsx
│   ├── i18n/                  # Internationalization
│   │   └── config.ts
│   ├── locales/               # Translation files
│   │   ├── ko/
│   │   ├── en/
│   │   ├── ja/
│   │   └── zh/
│   ├── styles/                # Global styles
│   │   └── diablo-theme.css
│   ├── types/                 # TypeScript types
│   │   └── index.ts
│   ├── App.tsx                # Root component
│   ├── App.css
│   └── main.tsx               # React entry
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
├── index.html                 # HTML entry
├── README.md                  # Basic readme
├── SETUP_GUIDE.md            # Detailed setup guide
└── PROJECT_SUMMARY.md        # This file
```

## 🔑 Important Constants

### Default Skill Slots
```typescript
Slot 1: Key='1', Interval=11ms   (Enabled)
Slot 2: Key='2', Interval=1000ms (Enabled)
Slot 3: Key='3', Interval=1008ms (Disabled)
Slot 4: Key='',  Interval=305ms  (Disabled)
Slot 5: Key='5', Interval=500ms  (Enabled)
Slot 6: Key='6', Interval=310ms  (Enabled)
Slot 7: Key='Space', Interval=100ms (Enabled)
Slot 8: Key='Q', Interval=1000ms (Enabled)
```

### Stop Key Mappings
```typescript
inventory: 'C'
skills: 'K'
follower: 'F'
map: 'Tab'
worldMap: 'M'
townPortal: 'T'
chat: 'Enter'
whisper: '/'
```

## ⚠️ Known Issues & Limitations

1. **robotjs Installation**: Requires Python 2.7 and Visual Studio Build Tools
2. **Global Shortcuts**: Some keys (Tab, Enter) may not work as global shortcuts
3. **Platform**: Windows only (robotjs has limited cross-platform support)
4. **Detection**: Software-level macro, potentially detectable by anti-cheat systems

## 🛠️ Customization Points

### Change Hotkey
`src/types/index.ts` → `DEFAULT_CONFIG.startStopKey`

### Add Language
1. Create `src/locales/[lang]/translation.json`
2. Import in `src/i18n/config.ts`
3. Add to `MenuBar.tsx` language selector

### Change Colors
`src/styles/diablo-theme.css` → CSS variables

### Change Intervals
`SkillSlot.tsx` → `max` prop on DiabloInput and DiabloSlider

## 📝 Next Steps (Future Enhancements)

- [ ] Add random delay UI toggle
- [ ] Add preset profiles
- [ ] Add tray icon
- [ ] Add global overlay
- [ ] Add macro recording
- [ ] Add click automation
- [ ] Add condition-based triggers

## 👨‍💻 Development Tips

### Debugging
- Main process logs: Check terminal
- Renderer logs: F12 DevTools in dev mode
- IPC communication: Add console.log in handlers

### Hot Reload
- React components: Auto-reload with Vite
- Electron main: Restart `npm run electron:dev`

### Testing
- Test with Notepad to verify key presses
- Use 100ms+ intervals to avoid system overload
- Test Stop Keys with Diablo 4 menus

## 📚 Dependencies

### Production
- `electron` - Desktop framework
- `react` + `react-dom` - UI library
- `i18next` + `react-i18next` - Internationalization
- `robotjs` - Keyboard automation
- `electron-store` - Configuration persistence
- `framer-motion` - Animations (optional)

### Development
- `typescript` - Type safety
- `vite` - Fast build tool
- `electron-builder` - App packaging
- `concurrently` - Run multiple scripts
- `tailwindcss` - CSS utilities (optional)

## 🎓 Learning Resources

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev)
- [robotjs](https://robotjs.io)
- [i18next](https://www.i18next.com)

---

**Version**: 2.1
**Created**: 2024
**Platform**: Windows
**License**: MIT (Educational purposes only)
