# 마우스 입력 지원 개발 문서

## 1. 개요

사용자가 스킬 슬롯의 트리거 키로 키보드 키뿐만 아니라 마우스 버튼(좌클릭, 우클릭, 휠 클릭)을 설정할 수 있도록 기능을 확장했습니다.

## 2. 변경 사항

### 2.1 타입 정의 (`src/types/index.ts`)

`SkillSlotConfig` 인터페이스의 `key` 속성 주석을 업데이트하여 마우스 입력 값을 명시했습니다.

- `MouseLeft`: 좌클릭
- `MouseRight`: 우클릭
- `MouseMiddle`: 휠(스크롤) 클릭

### 2.2 프론트엔드 (`src/components/SkillSlot.tsx`)

- **이벤트 핸들링**: 입력 필드에 `onMouseDown` 이벤트를 추가하여 마우스 클릭을 감지합니다.
- **기본 동작 방지**: `contextmenu` 이벤트를 막아 우클릭 시 브라우저 메뉴가 뜨지 않도록 처리했습니다.
- **값 매핑**:
  - 버튼 0 -> `MouseLeft`
  - 버튼 1 -> `MouseMiddle`
  - 버튼 2 -> `MouseRight`

### 2.3 백엔드 (`electron/main.ts`)

- **koffi & SendInput**: `robotjs` 대신 `koffi`를 사용하여 Windows API인 `SendInput`을 직접 호출합니다. 이는 더 안정적인 마우스 이벤트 시뮬레이션을 위함입니다.
- **clickMouse 함수**: 마우스 버튼에 따라 적절한 플래그(Down/Up)를 설정하여 입력을 전송하는 함수를 구현했습니다.
- **매크로 로직**: `startMacro` 루프에서 키 값이 `Mouse`로 시작하는 경우 `clickMouse`를 호출하도록 분기 처리를 추가했습니다.

## 3. 사용 방법

1. 스킬 슬롯의 키 입력 칸을 클릭합니다.
2. 원하는 마우스 버튼(좌/우/휠)을 클릭합니다.
3. 입력 칸에 `MouseLeft`, `MouseRight`, `MouseMiddle` 중 하나가 표시됩니다.
4. 슬롯을 활성화하고 매크로를 시작(F1)하면 해당 마우스 동작이 반복 실행됩니다.

## 4. 기술적 세부사항

- **Windows API**: `user32.dll`의 `SendInput` 함수를 사용합니다.
- **MOUSEINPUT 구조체**:
  - `dx`, `dy`: 0 (현재 위치에서 클릭)
  - `mouseData`: 0
  - `dwFlags`:
    - Left: `0x0002` (Down), `0x0004` (Up)
    - Right: `0x0008` (Down), `0x0010` (Up)
    - Middle: `0x0020` (Down), `0x0040` (Up)
