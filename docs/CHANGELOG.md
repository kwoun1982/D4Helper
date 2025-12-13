# Changelog

All notable changes to D4 Helper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.1] - 2025-12-13

### Added

- **ESC Key Emergency Stop**: Press ESC in-game to immediately stop all running profiles
- **Overlay Layout Reset**: New `↺` button to instantly reset overlay position to top-left (20, 20)
- **Layout Display Button**: Renamed from "Layout" to "레이아웃 표시" (Show Layout) for better clarity
- **Overlay Auto-Show**: Overlay automatically appears if missing when layout reset is triggered

### Changed

- **Layout Reset UX**: Removed confirmation dialog for faster reset operation
- **Reset Notification**: Added toast message "플로팅 창 위치가 초기화되었습니다" (Floating window position reset)
- **Overlay Position Logic**: Improved overlay window handling - now creates window if destroyed

### Fixed

- **Overlay Reset Issues**: Fixed bug where overlay wouldn't appear or move when reset was clicked
- **Window State**: Overlay position is now saved correctly even when window is closed

### Technical

- Enhanced `resetOverlayPosition()` function in `overlay-window.ts`
- Added `layoutReset` translation key to all 4 languages
- Improved overlay lifecycle management

---

## [2.0.0] - 2025-12-12

### Added

- **Multi-Profile System**: Create and manage multiple macro profiles
- **Independent Hotkeys**: Each profile can have its own F1-F12 start/stop key
- **Movable Overlay**: Drag-and-drop overlay window to any screen position
- **Layout Edit Mode**: Toggle overlay interaction with `📐 레이아웃 표시` button
- **Auto-Save**: All settings and window positions automatically saved
- **Profile Management**: Add, delete, rename profiles with ease

### Changed

- **UI Redesign**: Complete overhaul with multi-profile support
- **Window Persistence**: Main window position saved and restored
- **Overlay Persistence**: Overlay position saved and restored

### Technical

- Migrated from npm to Bun package manager
- Implemented `profile-state.ts` for per-profile state tracking
- Added `macro-controller.ts` for profile-based macro control
- Enhanced IPC communication for profile operations

---

## [1.0.1] - 2024-XX-XX

### Added

- Initial release with basic macro functionality
- 8 skill slots with interval control
- Stop Keys integration with Diablo 4 UI
- Multi-language support (Korean, English, Japanese, Chinese)

### Features

- Global F1 hotkey for start/stop
- Mouse button support (Left, Right, Middle)
- Hold-to-Pause special key
- Custom CSS Diablo theme

---

## [Unreleased]

### Planned Features

- Profile import/export
- Macro recording mode
- Advanced timing options (random delay, burst mode)
- Cloud sync for settings
- Custom overlay themes

---

**Legend:**

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerabilities
- `Technical` - Internal/development changes
