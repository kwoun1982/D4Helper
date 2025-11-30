import koffi from 'koffi';

// VK 코드 매핑 (Virtual Key Codes)
export const VK_CODES: Record<string, number> = {
  '1': 0x31, '2': 0x32, '3': 0x33, '4': 0x34, '5': 0x35,
  '6': 0x36, '7': 0x37, '8': 0x38, '9': 0x39, '0': 0x30,
  'Q': 0x51, 'W': 0x57, 'E': 0x45, 'R': 0x52, 'T': 0x54,
  'Y': 0x59, 'U': 0x55, 'I': 0x49, 'O': 0x4F, 'P': 0x50,
  'A': 0x41, 'S': 0x53, 'D': 0x44, 'F': 0x46, 'G': 0x47,
  'H': 0x48, 'J': 0x4A, 'K': 0x4B, 'L': 0x4C,
  'Z': 0x5A, 'X': 0x58, 'C': 0x43, 'V': 0x56, 'B': 0x42,
  'N': 0x4E, 'M': 0x4D,
  'SPACE': 0x20, 'ENTER': 0x0D, 'TAB': 0x09, 'ESCAPE': 0x1B,
  'F1': 0x70, 'F2': 0x71, 'F3': 0x72, 'F4': 0x73,
  'F5': 0x74, 'F6': 0x75, 'F7': 0x76, 'F8': 0x77,
  'F9': 0x78, 'F10': 0x79, 'F11': 0x7A, 'F12': 0x7B,
  '/': 0xBF,
  'INSERT': 0x2D, 'DELETE': 0x2E, 'HOME': 0x24, 'END': 0x23,
  'PAGEUP': 0x21, 'PAGEDOWN': 0x22,
  'UP': 0x26, 'DOWN': 0x28, 'LEFT': 0x25, 'RIGHT': 0x27,
  'COMMA': 0xBC, 'PERIOD': 0xBE, 'SEMICOLON': 0xBA, 'QUOTE': 0xDE,
  'BRACKETLEFT': 0xDB, 'BRACKETRIGHT': 0xDD, 'BACKSLASH': 0xDC, 'BACKQUOTE': 0xC0,
};

// 하드웨어 스캔 코드 (Scan Codes Set 1)
export const SCAN_CODES: Record<string, number> = {
  '1': 0x02, '2': 0x03, '3': 0x04, '4': 0x05, '5': 0x06,
  '6': 0x07, '7': 0x08, '8': 0x09, '9': 0x0A, '0': 0x0B,
  'Q': 0x10, 'W': 0x11, 'E': 0x12, 'R': 0x13, 'T': 0x14,
  'Y': 0x15, 'U': 0x16, 'I': 0x17, 'O': 0x18, 'P': 0x19,
  'A': 0x1E, 'S': 0x1F, 'D': 0x20, 'F': 0x21, 'G': 0x22,
  'H': 0x23, 'J': 0x24, 'K': 0x25, 'L': 0x26,
  'Z': 0x2C, 'X': 0x2D, 'C': 0x2E, 'V': 0x2F, 'B': 0x30,
  'N': 0x31, 'M': 0x32,
  'SPACE': 0x39, 'ENTER': 0x1C, 'TAB': 0x0F, 'ESCAPE': 0x01,
  'F1': 0x3B, 'F2': 0x3C, 'F3': 0x3D, 'F4': 0x3E,
  'F5': 0x3F, 'F6': 0x40, 'F7': 0x41, 'F8': 0x42,
  'F9': 0x43, 'F10': 0x44, 'F11': 0x57, 'F12': 0x58,
  '/': 0x35,
  'INSERT': 0x52, 'DELETE': 0x53, 'HOME': 0x47, 'END': 0x4F,
  'PAGEUP': 0x49, 'PAGEDOWN': 0x51,
  'UP': 0x48, 'DOWN': 0x50, 'LEFT': 0x4B, 'RIGHT': 0x4D,
  'COMMA': 0x33, 'PERIOD': 0x34, 'SEMICOLON': 0x27, 'QUOTE': 0x28,
  'BRACKETLEFT': 0x1A, 'BRACKETRIGHT': 0x1B, 'BACKSLASH': 0x2B, 'BACKQUOTE': 0x29,
};

// Windows SendInput API
const user32 = koffi.load('user32.dll');
const SendInput = user32.func('uint32 SendInput(uint32 nInputs, _Inout_ void *pInputs, int32 cbSize)');
const GetAsyncKeyState = user32.func('int16 GetAsyncKeyState(int32 vKey)');

const pendingKeyUps: Map<string, NodeJS.Timeout> = new Map();
const activeKeys: Set<string> = new Set();

export function sendKeyDown(key: string) {
  const scanCode = SCAN_CODES[key.toUpperCase()];
  if (!scanCode) return;

  const inputSize = 40;
  const input = Buffer.alloc(inputSize);

  input.writeUInt32LE(1, 0); // type = INPUT_KEYBOARD (1)
  input.writeUInt16LE(scanCode, 10); // wScan (Offset 10 for x64)
  input.writeUInt32LE(0x0008, 12); // dwFlags = KEYEVENTF_SCANCODE (0x0008) (Offset 12 for x64)

  SendInput(1, input, inputSize);
  activeKeys.add(key);
}

export function sendKeyUp(key: string) {
  const scanCode = SCAN_CODES[key.toUpperCase()];
  if (!scanCode) return;

  const inputSize = 40;
  const input = Buffer.alloc(inputSize);

  input.writeUInt32LE(1, 0); // type = INPUT_KEYBOARD (1)
  input.writeUInt16LE(scanCode, 10); // wScan (Offset 10 for x64)
  input.writeUInt32LE(0x0008 | 0x0002, 12); // dwFlags = KEYEVENTF_SCANCODE | KEYEVENTF_KEYUP (Offset 12 for x64)

  SendInput(1, input, inputSize);
  activeKeys.delete(key);
}

export function pressKey(key: string, duration: number = 50) {
  sendKeyDown(key);
  
  // Clear existing timeout for this key if any
  if (pendingKeyUps.has(key)) {
    clearTimeout(pendingKeyUps.get(key)!);
  }

  const timeout = setTimeout(() => {
    sendKeyUp(key);
    pendingKeyUps.delete(key);
  }, duration);
  
  pendingKeyUps.set(key, timeout);
}

export function clickMouse(button: string) {
  const inputSize = 40;
  const input = Buffer.alloc(inputSize * 2); // Down + Up

  let downFlag = 0;
  let upFlag = 0;

  if (button === 'MouseLeft') {
    downFlag = 0x0002; // MOUSEEVENTF_LEFTDOWN
    upFlag = 0x0004;   // MOUSEEVENTF_LEFTUP
  } else if (button === 'MouseRight') {
    downFlag = 0x0008; // MOUSEEVENTF_RIGHTDOWN
    upFlag = 0x0010;   // MOUSEEVENTF_RIGHTUP
  } else if (button === 'MouseMiddle') {
    downFlag = 0x0020; // MOUSEEVENTF_MIDDLEDOWN
    upFlag = 0x0040;   // MOUSEEVENTF_MIDDLEUP
  } else {
    return;
  }

  // Mouse Down
  input.writeUInt32LE(0, 0); 
  input.writeUInt32LE(downFlag, 20); 

  // Mouse Up
  input.writeUInt32LE(0, inputSize); 
  input.writeUInt32LE(upFlag, inputSize + 20); 

  SendInput(2, input, inputSize);
}

export function isKeyDown(key: string): boolean {
  const vkCode = VK_CODES[key.toUpperCase()];
  if (!vkCode) return false;
  
  const state = GetAsyncKeyState(vkCode);
  return (state & 0x8000) !== 0;
}

export function releaseAllKeys() {
  // Clear all pending KeyUps
  pendingKeyUps.forEach((timeout) => clearTimeout(timeout));
  pendingKeyUps.clear();

  // Force release all active keys
  activeKeys.forEach((key) => {
    sendKeyUp(key);
    console.log(`Force released key: ${key}`);
  });
  activeKeys.clear();
}
