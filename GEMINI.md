# D4 Helper - Gemini AI 컨텍스트 문서

> 이 문서는 Google Gemini 또는 다른 AI 어시스턴트가 이 프로젝트를 이해하고 작업할 수 있도록 작성된 컨텍스트 문서입니다.

---

## 📋 프로젝트 개요

### 프로젝트명

**D4 Helper - Sanctuary Edition (v2.0.3)**

![UI Screenshot](./docs/images/ui_screenshot_v2.0.3.png)

### 목적

디아블로 4 게임을 위한 스킬 자동 사용 데스크톱 애플리케이션. 사용자가 설정한 키를 지정된 시간 간격으로 자동 입력하여 반복적인 스킬 사용을 자동화합니다.

### 해상도

- **기본 크기**: 900 x 600 (Fixed Size)
- **최소 크기**: 800 x 500 (Resizable: False)

### 기술 스택

- **런타임**: Node.js 18+ LTS
- **프레임워크**: Electron 27+
- **UI**: React 18 + TypeScript
- **스타일링**: Custom CSS (Diablo 4 Theme)
- **빌드**: Vite
- **다국어**: i18next + react-i18next
- **키보드 제어**: koffi (Windows API Direct Call)
- **설정 저장**: electron-store

### 플랫폼

Windows 10/11 (64-bit)

---

## 🏗️ 프로젝트 구조

```
dia4helper_claude/
├── electron/                    # Electron 메인 프로세스
│   ├── main.ts                 # 매크로 로직, IPC 핸들러, 단축키 관리
│   └── preload.ts              # 보안 IPC 브릿지
│
├── src/
│   ├── components/             # React 컴포넌트
│   │   ├── ui/                # 재사용 가능한 UI 컴포넌트
│   │   │   ├── DiabloButton.tsx      # 디아블로 스타일 버튼
│   │   │   ├── DiabloSlider.tsx      # 빨간 슬라이더
│   │   │   ├── DiabloToggle.tsx      # 원형 토글 스위치
│   │   │   └── DiabloInput.tsx       # 스타일 입력 필드
│   │   │
│   │   ├── TitleBar.tsx        # 커스텀 타이틀바
│   │   ├── MenuBar.tsx         # 메뉴바 (저장/불러오기/언어)
│   │   ├── StartStopPanel.tsx  # 시작/정지 컨트롤
│   │   ├── StopKeysPanel.tsx   # Stop Keys 토글 리스트
│   │   ├── SkillSlot.tsx       # 개별 스킬 슬롯
│   │   ├── SkillKeysGrid.tsx   # 8개 슬롯 그리드
│   │   └── SpecialKeyPanel.tsx # Hold to Pause 패널
│   │
│   ├── i18n/
│   │   └── config.ts           # i18next 설정
│   │
│   ├── locales/                # 번역 파일
│   │   ├── ko/translation.json # 한국어
│   │   ├── en/translation.json # 영어
│   │   ├── ja/translation.json # 일본어
│   │   └── zh/translation.json # 중국어 간체
│   │
│   ├── styles/
│   │   └── diablo-theme.css    # 글로벌 디아블로 테마
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript 타입 정의
│   │
│   ├── App.tsx                 # 루트 컴포넌트
│   ├── App.css
│   └── main.tsx                # React 진입점
│
├── docs/                        # 문서
│   └── USER_MANUAL_KO.md       # 한국어 사용자 매뉴얼
│
├── package.json                # 의존성 및 스크립트
├── tsconfig.json               # TypeScript 설정
├── vite.config.ts              # Vite 빌드 설정
├── index.html                  # HTML 진입점
├── README.md                   # 기본 README
├── SETUP_GUIDE.md             # 설치 가이드
├── PROJECT_SUMMARY.md         # 프로젝트 요약
└── GEMINI.md                  # 이 문서
```

---

## 🎯 핵심 기능

### 1. 8개 스킬 슬롯 시스템

- 각 슬롯에 키보드 키 및 마우스 버튼 할당 가능
  - 좌클릭 (MouseLeft)
  - 우클릭 (MouseRight)
  - 휠 클릭 (MouseMiddle)
- 간격(interval) 설정: 0~5000ms
- 슬라이더와 직접 입력 지원
- 개별 활성화/비활성화

### 2. Start/Stop 제어

- **F1 글로벌 단축키**: 게임 중에도 동작
- 상태 표시: Running(녹색), Stopped(빨강), Paused(노랑)
- IPC를 통한 Electron Main ↔ Renderer 통신

### 3. Stop Keys (자동 일시정지)

디아블로 4 UI 키와 연동:

- Inventory (C)
- Skills (K)
- Follower (F)
- Map (Tab)
- World Map (M)
- Town Portal (T)
- Chat (Enter)
- Whisper (/)

활성화된 키를 누르면 매크로 자동 일시정지, 다시 누르면 재개.

### 4. Special Key (Hold to Pause)

- 특정 키를 누르고 있는 동안만 일시정지
- 정밀한 조준이나 이동 시 유용

### 5. 다국어 지원

- 한국어(기본)
- English
- 日本語
- 简体中文

### 6. 설정 저장/불러오기

- electron-store를 사용한 로컬 저장
- 자동 저장 및 복원

---

## 📊 데이터 구조

### AppConfig (src/types/index.ts)

```typescript
interface AppConfig {
  version: string; // "1.0.1"
  language: "ko" | "en" | "ja" | "zh";
  startStopKey: string; // "F1"
  skillSlots: SkillSlotConfig[]; // 8개 슬롯
  stopKeys: StopKeysConfig; // Stop Keys 설정
  specialKey: SpecialKeyConfig; // Special Key 설정
  options: {
    randomDelay: boolean;
    randomDelayPercent: number;
  };
}
```

### SkillSlotConfig

```typescript
interface SkillSlotConfig {
  slotNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  key: string; // '1', '2', 'Space', 'Q', '' (empty)
  interval: number; // ms 단위 (0~5000)
  enabled: boolean;
}
```

### StopKeysConfig

```typescript
interface StopKeysConfig {
  inventory: boolean; // C
  skills: boolean; // K
  follower: boolean; // F
  map: boolean; // Tab
  worldMap: boolean; // M
  townPortal: boolean; // T
  chat: boolean; // Enter
  whisper: boolean; // /
}
```

---

## 🔄 데이터 흐름

### 1. 매크로 시작 시퀀스

```
사용자 F1 입력
  ↓
Electron Main (globalShortcut 감지)
  ↓
startMacro() 함수 실행
  ↓
각 슬롯별 setInterval 생성
  ↓
robotjs.keyTap() 호출 (키 입력)
  ↓
상태 업데이트 → Renderer로 전송
  ↓
React 컴포넌트 UI 업데이트
```

### 2. Stop Key 감지 시퀀스

```
사용자 C 키 입력 (Inventory)
  ↓
globalShortcut 핸들러 감지
  ↓
pauseMacro('stopKey') 호출
  ↓
currentStatus.state = 'paused'
  ↓
상태 전송 → Renderer
  ↓
노란색 상태 표시
```

### 3. 설정 저장 시퀀스

```
사용자 💾 버튼 클릭
  ↓
MenuBar → App.tsx (handleSave)
  ↓
IPC: 'config:save' 호출
  ↓
Electron Main: electron-store에 저장
  ↓
성공 응답 → Renderer
```

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* 배경 */
--bg-primary: #1a1a1a; /* Main background (almost black) */
--bg-secondary: #242424; /* Panel background */
--bg-tertiary: #2d2d2d; /* Card/Box background */
--bg-input: #000000; /* Input background */

/* 테두리 */
--border-dark: #333333; /* Default border */
--border-gold: #8b7355; /* Gold accent border */
--border-red: #6b3030; /* Red accent border */

/* 강조색 */
--accent-green: #4a7c3f; /* Start button green */
--accent-red: #7c3f3f; /* Stop button red */
--accent-gold: #d4af37; /* Standard Gold */

/* 텍스트 */
--text-primary: #e8e8e8; /* Main text (light grey) */
--text-secondary: #a0a0a0; /* Secondary text */
--text-gold: #c9aa71; /* Gold text */
--text-red: #ff6b6b; /* Warning/Error text */
```

### 폰트

- **Primary**: 'Cinzel' (Gothic/Medieval)
- **Korean**: 'Noto Sans KR'
- **Monospace**: 키 표시용

### UI 패턴

1. **버튼**: 빨간 그라데이션 + 금색 테두리
2. **슬라이더**: 빨간 채움 + 금색 원형 핸들
3. **토글**: 원형, ON일 때 빨간 불빛 + 글로우
4. **패널**: 어두운 빨강 배경 + 테두리 글로우

---

## 🔧 주요 기술 구현

### 1. Electron IPC 통신

**Preload (electron/preload.ts)**

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
  macroStart: () => ipcRenderer.invoke("macro:start"),
  macroStop: () => ipcRenderer.invoke("macro:stop"),
  configSave: (config) => ipcRenderer.invoke("config:save", config),
  onStatusUpdate: (callback) => ipcRenderer.on("status:update", callback),
});
```

**Main (electron/main.ts)**

```typescript
ipcMain.handle("macro:start", async () => {
  startMacro();
});

ipcMain.handle("config:save", async (_, config) => {
  store.set("config", config);
  return { success: true };
});
```

**Renderer (src/App.tsx)**

```typescript
const handleStart = async () => {
  await window.electronAPI.macroStart();
};

useEffect(() => {
  window.electronAPI.onStatusUpdate((newStatus) => {
    setStatus(newStatus);
  });
}, []);
```

### 2. robotjs 키 입력

```typescript
// electron/main.ts
function startMacro() {
  config.skillSlots.forEach((slot) => {
    if (slot.enabled && slot.key) {
      const timer = setInterval(() => {
        if (currentStatus.state === "running") {
          robot.keyTap(slot.key.toLowerCase());
        }
      }, slot.interval);

      macroIntervals.set(slot.slotNumber, timer);
    }
  });
}
```

### 3. 글로벌 단축키

```typescript
// electron/main.ts
globalShortcut.register("F1", () => {
  if (currentStatus.state === "running") {
    stopMacro("manual");
  } else {
    startMacro();
  }
});
```

### 4. i18n 다국어

**설정 (src/i18n/config.ts)**

```typescript
i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: koTranslation },
    en: { translation: enTranslation },
  },
  lng: "ko",
  fallbackLng: "en",
});
```

**사용 (컴포넌트)**

```typescript
const { t } = useTranslation();

return <h3>{t("skillKeys.title")}</h3>; // "Skill Keys"
```

---

## 🚀 빌드 및 실행

### 개발 모드

```bash
npm install
npm run electron:dev
```

### 프로덕션 빌드

```bash
npm run electron:build
```

생성물:

- `release/D4 Helper Setup 2.1.0.exe` (설치 프로그램)
- `release/D4 Helper 2.1.0.exe` (포터블)

---

## 🐛 알려진 이슈 및 제약사항

### 1. robotjs 설치 문제

- **증상**: `node-gyp rebuild` 실패
- **원인**: Python 2.7 및 Visual Studio Build Tools 필요
- **해결**:
  ```bash
  npm install --global windows-build-tools
  ```

### 2. 일부 Stop Keys 미작동

- **증상**: Tab, Enter 같은 특수 키가 글로벌 단축키로 등록 안 됨
- **원인**: Windows 시스템 제약
- **해결**: 대체 키 사용 권장

### 3. 매크로 감지 위험

- **증상**: 게임 보안 시스템 감지 가능
- **원인**: 소프트웨어 레벨 키 입력
- **주의**: 교육 목적으로만 사용 권장

### 4. 키 입력 제한

- **증상**: 일부 특수 키(Insert, Home 등)가 인식되지 않음
- **해결**: v1.0.1에서 입력 관리자(input-manager.ts) 업데이트로 지원 키 확장됨

---

## 📝 작업 시 참고사항

### 코드 수정 시

1. **타입 정의**: `src/types/index.ts` 먼저 확인
2. **IPC 채널**: 새 채널 추가 시 preload.ts와 main.ts 모두 수정
3. **번역**: 새 텍스트 추가 시 4개 언어 모두 업데이트

### 새 기능 추가 시

1. `src/types/index.ts`에 타입 정의
2. `electron/main.ts`에 백엔드 로직
3. `src/components/`에 UI 컴포넌트
4. `src/locales/`에 번역 추가
5. `src/App.tsx`에 통합

### 디버깅

- **Main Process**: 터미널 로그 확인
- **Renderer**: F12 DevTools 사용
- **IPC**: 양쪽에 console.log 추가

---

## 🎓 AI 어시스턴트를 위한 가이드

### 자주 하는 작업

#### 1. 새 스킬 슬롯 추가 (8개 → 10개로 확장)

```typescript
// src/types/index.ts
slotNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// DEFAULT_CONFIG에 슬롯 추가
{ slotNumber: 9, key: '', interval: 1000, enabled: false },
{ slotNumber: 10, key: '', interval: 1000, enabled: false },
```

#### 2. 새 Stop Key 추가

```typescript
// src/types/index.ts
interface StopKeysConfig {
  // ... 기존 키들
  emote: boolean;  // Y 키
}

export const STOP_KEY_MAPPING = {
  // ... 기존 매핑
  emote: 'Y',
};

// src/locales/ko/translation.json
"stopKeys": {
  // ... 기존 번역
  "emote": "감정표현"
}
```

#### 3. UI 색상 변경

```css
/* src/styles/diablo-theme.css */
:root {
  --accent-red: #ff0000; /* 더 밝은 빨강으로 변경 */
}
```

#### 4. 기본 단축키 변경 (F1 → F2)

```typescript
// src/types/index.ts
export const DEFAULT_CONFIG: AppConfig = {
  // ...
  startStopKey: "F2",
  // ...
};
```

### 테스트 방법

1. **키 입력 테스트**: 메모장이나 노트패드에서 실행
2. **간격 테스트**: 1000ms로 설정하고 초시계 확인
3. **Stop Keys**: 디아블로 4 실행 후 테스트
4. **다국어**: 언어 전환 후 모든 화면 확인

---

## 📦 의존성 목록

### 프로덕션 의존성

```json
{
  "electron": "^27.0.0", // 데스크톱 프레임워크
  "react": "^18.2.0", // UI 라이브러리
  "react-dom": "^18.2.0",
  "i18next": "^23.7.0", // 다국어 핵심
  "react-i18next": "^13.5.0", // React 바인딩
  "robotjs": "^0.6.0", // 키보드 제어
  "electron-store": "^8.1.0", // 설정 저장
  "framer-motion": "^10.16.0" // 애니메이션
}
```

### 개발 의존성

```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "electron-builder": "^24.6.4",
  "concurrently": "^8.2.2"
}
```

---

## 🔐 보안 고려사항

### 1. 권한

- 관리자 권한 필요 (robotjs)
- 키보드 입력 후킹

### 2. IPC 보안

- `contextIsolation: true`
- `nodeIntegration: false`
- preload 스크립트로 제한된 API만 노출

### 3. 데이터

- 로컬 저장만 사용
- 네트워크 통신 없음
- 개인정보 수집 없음

---

## 📞 추가 정보

### 파일 위치

- **설정 파일**: `%APPDATA%/d4-helper/config.json`
- **로그**: 터미널 출력 (파일 로그 없음)

### 성능

- **메모리**: ~100MB
- **CPU**: Idle 1% 미만, 실행 중 5% 미만
- **권장 간격**: 50ms 이상

### 라이선스

MIT License - 교육 목적으로만 사용

---

## 🎯 자주 받는 요청

### "새 기능을 추가해주세요"

1. 기능 명세 확인
2. 타입 정의 추가
3. 백엔드 로직 구현 (electron/main.ts)
4. UI 컴포넌트 생성
5. 번역 추가
6. 테스트

### "버그를 수정해주세요"

1. 증상 재현
2. 로그 확인 (Main/Renderer)
3. 관련 파일 찾기
4. 수정 및 테스트

### "코드를 리팩토링해주세요"

1. 현재 구조 이해
2. 변경 영향 범위 파악
3. 타입 먼저 수정
4. 단계적 리팩토링
5. 기능 테스트

---

**이 문서를 읽은 AI는 D4 Helper 프로젝트의 모든 컨텍스트를 이해하고 작업할 수 있습니다.**

**마지막 업데이트**: 2025-11-29
**문서 버전**: 1.0.1
