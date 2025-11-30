# D4 Helper - Sanctuary Edition (v2.1)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-2.1.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

![D4 Helper v2.1 UI](./docs/images/ui_screenshot_v2.1.png)

디아블로 4 플레이어를 위한 **스킬 자동 사용 도우미**입니다.  
반복적인 스킬 입력을 자동화하여 손목 피로를 줄이고 게임 플레이에 더욱 집중할 수 있도록 도와줍니다.

> **⚠️ 주의사항**: 이 프로그램은 교육 목적으로 제작되었으며, 게임사의 약관에 위배될 수 있습니다. 사용에 따른 책임은 사용자 본인에게 있습니다.

---

## ✨ 주요 기능

### 1. ⚔️ 8개의 스킬 슬롯

- 최대 8개의 스킬 키를 등록하여 자동 사용할 수 있습니다.
- 각 슬롯별로 **0ms ~ 5000ms**까지 정밀한 간격 설정이 가능합니다.
- 직관적인 슬라이더와 직접 입력을 통해 간편하게 설정할 수 있습니다.

### 2. 🎮 스마트한 제어 시스템

- **F1 키**: 게임 플레이 중 언제든지 매크로를 시작하거나 중지할 수 있습니다.
- **상태 표시**: 실행 중(초록), 정지(빨강), 일시정지(노랑) 상태를 시각적으로 명확하게 보여줍니다.

### 3. 🛑 Stop Keys (자동 일시정지)

게임 내 UI를 열거나 채팅을 할 때 매크로가 자동으로 일시정지됩니다.

- **지원 키**: 인벤토리(C), 스킬창(K), 추종자(F), 지도(Tab), 월드맵(M), 포탈(T), 채팅(Enter), 귓속말(/)
- 각 키는 설정에서 개별적으로 켜고 끌 수 있습니다.

### 4. 💀 Hold to Pause (누르고 있으면 일시정지)

- 특정 키(기본값: Shift)를 누르고 있는 동안 매크로를 잠시 멈출 수 있습니다.
- 정밀한 조준이나 이동이 필요할 때 유용합니다.

### 5. 🌍 다국어 지원

- **한국어**, English, 日本語, 简体中文을 완벽하게 지원합니다.

### 6. 💾 설정 자동 저장

- 모든 설정은 자동으로 저장되며, 프로그램을 다시 실행하면 이전 설정이 그대로 복원됩니다.

---

## 🛠 기술 스택

이 프로젝트는 최신 웹 기술과 데스크톱 앱 프레임워크를 사용하여 제작되었습니다.

- **Runtime**: Node.js 18+ LTS
- **Framework**: Electron 27+
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Custom CSS (Diablo 4 Theme)
- **Library**:
  - `robotjs`: 키보드 제어
  - `i18next`: 다국어 처리
  - `electron-store`: 로컬 데이터 저장

---

## 🚀 설치 및 실행 방법

### 1. 설치

이 저장소를 클론하고 의존성 패키지를 설치합니다.

```bash
git clone https://github.com/your-username/dia4helper.git
cd dia4helper
npm install
```

> **참고**: `robotjs` 빌드를 위해 Windows Build Tools가 필요할 수 있습니다.
> `npm install --global windows-build-tools`

### 2. 개발 모드 실행

소스 코드를 수정하거나 개발 버전을 실행하려면 다음 명령어를 사용합니다.

```bash
npm run electron:dev
```

### 3. 빌드 (실행 파일 생성)

Windows용 실행 파일(.exe)을 생성합니다.

```bash
npm run electron:build
```

빌드가 완료되면 `release` 폴더에 설치 파일과 포터블 실행 파일이 생성됩니다.

---

## 🎨 디자인 테마

디아블로 4의 어둡고 고딕한 분위기를 UI에 그대로 담았습니다.

- **Color**: 딥 레드와 골드 엑센트를 사용한 고급스러운 배색
- **Font**: 'Cinzel' 폰트를 사용하여 중세 판타지 느낌 구현
- **Components**: 게임 내 UI와 유사한 버튼, 슬라이더, 토글 스위치 디자인

---

## 📝 라이선스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다. 자유롭게 수정하고 배포할 수 있습니다.
