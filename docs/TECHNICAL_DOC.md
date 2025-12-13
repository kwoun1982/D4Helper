# D4 Helper - 기술 문서 (Technical Documentation)

**버전**: 2.0.1  
**최종 업데이트**: 2025-12-13

---

## 목차

1. [아키텍처 개요](#아키텍처-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [핵심 모듈](#핵심-모듈)
4. [데이터 흐름](#데이터-흐름)
5. [주요 기능 구현](#주요-기능-구현)
6. [개발 가이드](#개발-가이드)
7. [빌드 및 배포](#빌드-및-배포)

---

## 아키텍처 개요

D4 Helper는 Electron 기반 데스크톱 애플리케이션으로, Main Process와 Renderer Process로 구성됩니다.

```
┌─────────────────────────────────────────────────┐
│                 Main Process                     │
│  ┌──────────────────────────────────────────┐  │
│  │  Macro Engine (Profile Management)       │  │
│  │  - Profile Controller                    │  │
│  │  - Key Poller (Global Hotkeys)           │  │
│  │  - Input Manager (Windows API)           │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Overlay Window (Transparent)            │  │
│  │  - Always on Top                         │  │
│  │  - Click-through / Draggable             │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  Config Manager (electron-store)         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                        ↕ IPC
┌─────────────────────────────────────────────────┐
│              Renderer Process                    │
│  ┌──────────────────────────────────────────┐  │
│  │  React App (Main Window)                 │  │
│  │  - Profile UI                            │  │
│  │  - Skill Slots Grid                      │  │
│  │  - MenuBar                               │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │  React Overlay (Overlay Window)          │  │
│  │  - Status Display                        │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 프로젝트 구조

```
dia4helper/
├── electron/                    # Electron 메인 프로세스
│   ├── main.ts                 # 앱 진입점, 윈도우 관리
│   ├── preload.ts              # IPC 브릿지
│   ├── ipc-handlers.ts         # IPC 핸들러 등록
│   ├── config-manager.ts       # 설정 저장/로드
│   ├── macro-engine.ts         # 매크로 코디네이터
│   ├── macro-controller.ts     # 프로필별 매크로 제어
│   ├── profile-state.ts        # 프로필 상태 관리
│   ├── key-poller.ts           # 글로벌 키 폴링
│   ├── input-manager.ts        # Windows API 키 입력
│   └── overlay-window.ts       # 오버레이 윈도우 관리
│
├── src/                        # React 렌더러 프로세스
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                # 재사용 UI 컴포넌트
│   │   ├── TitleBar.tsx
│   │   ├── MenuBar.tsx
│   │   ├── ProfileList.tsx
│   │   ├── SkillKeysGrid.tsx
│   │   └── StopKeysPanel.tsx
│   │
│   ├── overlay/                # 오버레이 앱
│   │   ├── OverlayApp.tsx
│   │   ├── overlay.css
│   │   └── overlay.html
│   │
│   ├── i18n/                   # 국제화
│   │   └── config.ts
│   │
│   ├── locales/                # 번역 파일
│   │   ├── ko/translation.json
│   │   ├── en/translation.json
│   │   ├── ja/translation.json
│   │   └── zh/translation.json
│   │
│   ├── types/                  # TypeScript 타입
│   │   └── index.ts
│   │
│   ├── App.tsx                 # 메인 앱 컴포넌트
│   └── main.tsx                # React 진입점
│
├── docs/                       # 문서
│   ├── USER_GUIDE.md          # 사용자 가이드
│   ├── TECHNICAL_DOC.md       # 기술 문서
│   └── CHANGELOG.md           # 변경 로그
│
├── build/                      # 빌드 리소스
│   └── icon.ico
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 핵심 모듈

### 1. Main Process (electron/)

#### main.ts

- Electron 앱 라이프사이클 관리
- 메인 윈도우 및 오버레이 윈도우 생성
- 앱 종료 시 정리 작업

**핵심 코드:**

```typescript
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1056,
    height: 750,
    frame: false,
    icon: nativeImage.createFromPath(iconPath),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
  });
}
```

#### macro-controller.ts

- 프로필별 매크로 시작/정지
- 스킬 슬롯 인터벌 관리
- 상태 업데이트 브로드캐스트

**핵심 함수:**

- `startProfile(profileId, config)`: 프로필 시작
- `stopProfile(profileId, config)`: 프로필 정지
- `stopAllProfiles(config)`: 모든 프로필 정지

#### key-poller.ts

- 글로벌 키보드 폴링 (10ms 간격)
- 프로필별 시작/정지 키 감지
- Stop Keys 감지
- ESC 키 긴급 정지

**핵심 코드:**

```typescript
setInterval(() => {
  // Check all profile start/stop keys
  config.profiles.forEach((profile) => {
    if (isKeyDown(profile.startStopKey)) {
      toggleProfile(profile.id);
    }
  });

  // Check ESC key for emergency stop
  if (isKeyDown("ESCAPE")) {
    stopAllProfiles();
  }
}, 10);
```

#### input-manager.ts

- Windows API (User32.dll) 직접 호출
- 가상 키 코드(VK_CODE) 및 스캔 코드 매핑
- 키 상태 확인 및 키 입력 시뮬레이션

**핵심 함수:**

- `isKeyDown(key)`: 키 눌림 상태 확인
- `pressKey(key)`: 키 입력 시뮬레이션
- `sendKeyDown(vkCode)`: 키 다운 이벤트
- `sendKeyUp(vkCode)`: 키 업 이벤트

#### overlay-window.ts

- 투명 오버레이 윈도우 생성
- Always-on-top 설정
- 클릭 스루 / 드래그 모드 전환
- 위치 리셋 기능

**핵심 함수:**

- `createOverlayWindow()`: 오버레이 생성
- `setOverlayInteractive(bool)`: 상호작용 모드 전환
- `resetOverlayPosition()`: 위치 초기화
- `updateOverlayStatus(profiles)`: 상태 업데이트

### 2. Renderer Process (src/)

#### App.tsx

- 전역 상태 관리 (config, status, toast)
- 프로필 CRUD 작업
- 파일 저장/불러오기
- IPC 통신

**핵심 상태:**

```typescript
const [config, setConfig] = useState<AppConfig>();
const [status, setStatus] = useState<MacroStatus>();
const [isOverlayInteractive, setIsOverlayInteractive] = useState(false);
```

#### ProfileList.tsx

- 프로필 목록 표시
- 프로필 선택/추가/삭제
- 시작/정지 버튼
- 프로필별 상태 표시

#### SkillKeysGrid.tsx

- 8개 스킬 슬롯 표시
- 키 입력 감지
- 간격 설정 슬라이더
- 활성화 토글

#### OverlayApp.tsx

- 오버레이 UI 렌더링
- 드래그 핸들 표시 (상호작용 모드)
- 프로필 상태 업데이트 수신

---

## 데이터 흐름

### 1. 매크로 시작 시퀀스

```
사용자가 F1 키 입력
  ↓
key-poller.ts: 키 감지
  ↓
macro-controller.ts: startProfile(profileId)
  ↓
각 스킬 슬롯별 setInterval 생성
  ↓
input-manager.ts: pressKey(key)
  ↓
Windows API: SendInput 호출
  ↓
profile-state.ts: 상태 업데이트
  ↓
overlay-window.ts: updateOverlayStatus()
  ↓
Overlay React: UI 업데이트
```

### 2. 설정 저장 시퀀스

```
사용자가 💾 버튼 클릭
  ↓
App.tsx: handleSave()
  ↓
IPC: 'config:save' 호출
  ↓
ipc-handlers.ts: config:save 핸들러
  ↓
config-manager.ts: saveConfig()
  ↓
electron-store: 파일 저장
  ↓
성공 응답 → Renderer
  ↓
Toast 메시지 표시
```

### 3. 오버레이 이동 시퀀스

```
사용자가 📐 버튼 클릭
  ↓
App.tsx: handleToggleOverlayInteractive()
  ↓
IPC: 'overlay:set-interactive' 호출
  ↓
overlay-window.ts: setOverlayInteractive(true)
  ↓
setIgnoreMouseEvents(false)
  ↓
OverlayApp: 드래그 핸들 표시
  ↓
사용자가 오버레이 드래그
  ↓
'move' 이벤트 발생
  ↓
config-manager.ts: 위치 저장 (debounced)
```

---

## 주요 기능 구현

### 1. 다중 프로필 시스템

**데이터 구조:**

```typescript
interface MacroProfile {
  id: string;
  name: string;
  startStopKey: string; // F1-F12
  skillSlots: SkillSlotConfig[];
}

interface AppConfig {
  profiles: MacroProfile[];
  selectedProfileId: string;
  // ...
}
```

**구현 포인트:**

- 각 프로필은 독립적인 `setInterval` 인스턴스 보유
- `profile-state.ts`에서 프로필별 상태 추적
- `key-poller.ts`에서 모든 프로필의 단축키 동시 모니터링

### 2. 오버레이 시스템

**특징:**

- 투명 배경 (`transparent: true`)
- 항상 최상위 (`alwaysOnTop: true, 'screen-saver'`)
- 작업 표시줄 숨김 (`skipTaskbar: true`)

**상호작용 모드:**

```typescript
// 편집 모드 ON
overlayWindow.setIgnoreMouseEvents(false);
overlayWindow.setFocusable(true);

// 편집 모드 OFF (클릭 스루)
overlayWindow.setIgnoreMouseEvents(true, { forward: true });
overlayWindow.setFocusable(false);
```

### 3. 글로벌 키 폴링

Windows API를 사용한 로우레벨 키 감지:

```typescript
import { GetAsyncKeyState } from "win32-api";

function isKeyDown(key: string): boolean {
  const vkCode = VK_CODES[key];
  const state = GetAsyncKeyState(vkCode);
  return (state & 0x8000) !== 0; // High-order bit
}
```

**폴링 주기:** 10ms (100Hz)

### 4. ESC 키 긴급 정지

**구현 위치:** `key-poller.ts`

```typescript
// Global key polling
if (risingEdge("ESCAPE")) {
  console.log("[KEY-POLLER] ESC pressed, stopping all profiles");
  stopAllProfiles(currentConfig);
}
```

### 5. 레이아웃 초기화

**구현 위치:** `overlay-window.ts`

```typescript
export function resetOverlayPosition() {
  // 1. 설정 업데이트
  currentConfig.overlay.position = { x: 20, y: 20 };
  saveConfig(currentConfig);

  // 2. 윈도우 이동
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setPosition(20, 20);
    overlayWindow.show();
  } else {
    // 윈도우가 없으면 새로 생성
    createOverlayWindow();
  }
}
```

### 6. 창 위치 저장

**구현 위치:** `main.ts`

```typescript
let moveTimer: NodeJS.Timeout;

mainWindow.on("move", () => {
  if (moveTimer) clearTimeout(moveTimer);
  moveTimer = setTimeout(() => {
    const [x, y] = mainWindow.getPosition();
    config.windowPosition = { x, y };
    saveConfig(config);
  }, 500); // 500ms debounce
});
```

---

## 개발 가이드

### 개발 환경 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-repo/d4-helper.git
cd d4-helper

# 2. Bun 설치 (권장)
# https://bun.sh/

# 3. 의존성 설치
bun install

# 4. 개발 서버 시작
bun run electron:dev
```

### 새 기능 추가 시 체크리스트

1. **타입 정의** (`src/types/index.ts`)

   - 새 데이터 구조 정의
   - 기존 타입 확장

2. **Main Process** (`electron/`)

   - IPC 핸들러 추가 (`ipc-handlers.ts`)
   - Preload 노출 (`preload.ts`)
   - 백엔드 로직 구현

3. **Renderer Process** (`src/`)

   - UI 컴포넌트 작성
   - 전역 상태 통합 (`App.tsx`)

4. **다국어** (`src/locales/`)

   - 4개 언어 모두 번역 추가

5. **테스트**
   - 개발 모드에서 기능 확인
   - 프로덕션 빌드 테스트

### 디버깅

**Main Process 로그:**

```bash
# 터미널에 출력됨
console.log('[MODULE] Message');
```

**Renderer Process 로그:**

```bash
# F12 DevTools에서 확인
console.log('Renderer log');
```

**IPC 통신 디버깅:**

```typescript
// Renderer
const result = await window.electronAPI.someMethod();
console.log("IPC result:", result);

// Main
ipcMain.handle("some-method", async () => {
  console.log("[IPC] some-method called");
  return { success: true };
});
```

---

## 빌드 및 배포

### 프로덕션 빌드

```bash
# 전체 빌드 (React + Electron + Packaging)
bun run electron:build
```

**생성 파일:**

- `release/D4Helper_v2.0.1.exe` (포터블 실행 파일)

### 빌드 설정

`package.json`:

```json
"build": {
  "appId": "com.vivecoding.d4helper",
  "productName": "D4 Helper",
  "win": {
    "target": "portable",
    "icon": "build/icon.ico"
  },
  "artifactName": "D4Helper_v${version}.${ext}"
}
```

### 버전 업데이트

1. `package.json`의 `version` 수정
2. `src/components/TitleBar.tsx`의 버전 표시 수정
3. `README.md` 업데이트
4. `docs/CHANGELOG.md` 작성

### 릴리스 체크리스트

- [ ] 모든 기능 테스트 완료
- [ ] 버전 번호 업데이트
- [ ] 문서 업데이트
- [ ] 빌드 성공 확인
- [ ] 실행 파일 테스트
- [ ] Git 태그 생성
- [ ] GitHub Release 발행

---

## 성능 최적화

### 1. 키 폴링 최적화

- Rising Edge 감지로 중복 이벤트 방지
- 이전 상태 캐싱

### 2. 설정 저장 최적화

- Debounce (500ms) 적용
- 불필요한 저장 방지

### 3. 오버레이 성능

- `backgroundThrottling: false`로 백그라운드 성능 유지
- 최소한의 DOM 업데이트

---

## 보안 고려사항

### 1. Context Isolation

```typescript
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
}
```

### 2. IPC 화이트리스트

모든 IPC는 `preload.ts`에서 명시적으로 노출:

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  // 허용된 메서드만 노출
  configSave: (config) => ipcRenderer.invoke("config:save", config),
});
```

### 3. 입력 검증

사용자 입력은 백엔드에서 검증:

```typescript
ipcMain.handle("config:save", async (_, config: AppConfig) => {
  if (!config.profiles || !Array.isArray(config.profiles)) {
    throw new Error("Invalid config");
  }
  saveConfig(config);
});
```

---

**버전**: 2.0.1  
**최종 업데이트**: 2025-12-13  
**개발자**: WAYNE
