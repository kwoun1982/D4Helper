import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TitleBar from './components/TitleBar';
import MenuBar from './components/MenuBar';
import StopKeysPanel from './components/StopKeysPanel';
import SkillKeysGrid from './components/SkillKeysGrid';
import ProfileList from './components/ProfileList';
import Toast from './components/Toast';
import { AppConfig, MacroStatus, DEFAULT_CONFIG, MacroProfile, SkillSlotConfig } from './types';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<MacroStatus>({ state: 'stopped', activeSlots: [], runningProfiles: {} });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [currentFilePath, setCurrentFilePath] = useState<string>('기본 설정');
  const [isOverlayInteractive, setIsOverlayInteractive] = useState(false);

  // 초기 설정 로드
  useEffect(() => {
    window.electronAPI.configLoad().then((loadedConfig) => {
      setConfig(loadedConfig);
      i18n.changeLanguage(loadedConfig.language);
    });

    // 상태 업데이트 리스너
    window.electronAPI.onStatusUpdate((newStatus) => {
      setStatus(newStatus);
    });
  }, [i18n]);

  // 경로에서 파일명만 추출하고 번역
  const getTranslatedFileName = (filePath: string): string => {
    // 특수 키워드 처리
    if (!filePath || filePath === '기본 설정') return t('menu.defaultConfig');
    if (filePath === '외부 파일') return t('menu.externalFile');

    // 프로필 패턴 처리 (예: "프로필 1" -> "Profile 1")
    const profileMatch = filePath.match(/^프로필\s+(\d+)$/);
    if (profileMatch) {
      return `${t('menu.profilePrefix')} ${profileMatch[1]}`;
    }

    // 경로에서 파일명 추출
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];

    // 파일명에서도 프로필 패턴 확인
    const fileProfileMatch = fileName.match(/^프로필\s+(\d+)/);
    if (fileProfileMatch) {
      return `${t('menu.profilePrefix')} ${fileProfileMatch[1]}`;
    }

    return fileName;
  };


  // 설정 저장
  const handleSave = async () => {
    const result = await window.electronAPI.configSave(config);
    if (result.success) {
      console.log('Config saved successfully');
      showToast(t('messages.saveSuccess'), 'success');
    } else {
      showToast(t('messages.saveFailed'), 'error');
    }
  };

  // 설정 불러오기 (파일 선택 다이얼로그)
  const handleLoad = async () => {
    const result = await window.electronAPI.fileOpen();

    if (result.canceled) {
      // 사용자가 취소한 경우 - 아무것도 하지 않음
      return;
    }

    if (!result.success || !result.config) {
      // 에러 발생
      const errorMsg = result.error || t('messages.fileNotReadable');
      showToast(`${t('messages.loadFailed')}: ${errorMsg}`, 'error');
      return;
    }

    // 성공적으로 로드
    setConfig(result.config);
    i18n.changeLanguage(result.config.language);
    setCurrentFilePath(result.filePath || '외부 파일');
    showToast(t('messages.loadSuccess'), 'success');
  };

  // 다른이름으로 저장 (파일 선택 다이얼로그)
  const handleSaveAs = async () => {
    const result = await window.electronAPI.fileSave(config);

    if (result.canceled) return;

    if (!result.success) {
      const errorMsg = result.error || t('messages.fileNotSaveable');
      showToast(`${t('messages.saveFailed')}: ${errorMsg}`, 'error');
      return;
    }

    // 성공적으로 저장
    if (result.filePath) {
      setCurrentFilePath(result.filePath);
    }
    showToast(t('messages.fileSaved'), 'success');
  };

  // 언어 변경
  const handleLanguageChange = (lang: 'ko' | 'en' | 'ja' | 'zh') => {
    i18n.changeLanguage(lang);
    setConfig({ ...config, language: lang });
  };

  // Per-profile start/stop
  const handleStartProfile = async (profileId: string) => {
    await window.electronAPI.startProfile(profileId);
  };

  const handleStopProfile = async (profileId: string) => {
    await window.electronAPI.stopProfile(profileId);
  };

  // Toast handler
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Profile Management
  const getSelectedProfile = (): MacroProfile => {
    return config.profiles.find(p => p.id === config.selectedProfileId) || config.profiles[0];
  };

  const handleSelectProfile = async (id: string) => {
    const newConfig = { ...config, selectedProfileId: id };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  const handleAddProfile = async () => {
    // Find the next profile number
    const profileNumbers = config.profiles
      .map(p => {
        const match = p.name.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = profileNumbers.length > 0
      ? Math.max(...profileNumbers) + 1
      : config.profiles.length + 1;

    // Find the next available F key (F1-F12)
    const usedKeys = new Set(config.profiles.map(p => p.startStopKey.toUpperCase()));
    let nextKey = 'F1';
    for (let i = 1; i <= 12; i++) {
      const key = `F${i}`;
      if (!usedKeys.has(key)) {
        nextKey = key;
        break;
      }
    }

    const newProfile: MacroProfile = {
      id: Date.now().toString(),
      name: `${t('menu.profilePrefix')} ${nextNumber}`,
      startStopKey: nextKey,
      skillSlots: [
        { slotNumber: 1, key: '', interval: 1000, enabled: false },
        { slotNumber: 2, key: '', interval: 1000, enabled: false },
        { slotNumber: 3, key: '', interval: 1000, enabled: false },
        { slotNumber: 4, key: '', interval: 1000, enabled: false },
        { slotNumber: 5, key: '', interval: 1000, enabled: false },
        { slotNumber: 6, key: '', interval: 1000, enabled: false },
        { slotNumber: 7, key: '', interval: 1000, enabled: false },
        { slotNumber: 8, key: '', interval: 1000, enabled: false },
      ]
    };
    const newConfig = { ...config, profiles: [...config.profiles, newProfile], selectedProfileId: newProfile.id };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  const handleDeleteProfile = async (id: string) => {
    if (config.profiles.length <= 1) return;
    const newProfiles = config.profiles.filter(p => p.id !== id);
    const newSelectedId = config.selectedProfileId === id ? newProfiles[0].id : config.selectedProfileId;
    const newConfig = { ...config, profiles: newProfiles, selectedProfileId: newSelectedId };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  const handleRenameProfile = async (id: string, newName: string) => {
    const newProfiles = config.profiles.map(p => p.id === id ? { ...p, name: newName } : p);
    const newConfig = { ...config, profiles: newProfiles };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  // 단축키 변경 (Per Profile)
  const handleKeyChange = async (profileId: string, key: string) => {
    console.log('handleKeyChange called:', profileId, key);
    const newProfiles = config.profiles.map(p =>
      p.id === profileId ? { ...p, startStopKey: key } : p
    );
    const newConfig = { ...config, profiles: newProfiles };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  const handleToggleOverlayInteractive = () => {
    const newState = !isOverlayInteractive;
    setIsOverlayInteractive(newState);
    window.electronAPI.setOverlayInteractive(newState);
    showToast(newState ? t('messages.overlayEditEnabled') : t('messages.overlayEditDisabled'), 'info');
  };

  const handleResetOverlay = async () => {
    await window.electronAPI.resetOverlayPosition();
    showToast(t('messages.layoutReset'), 'info');
  };

  // 스킬 슬롯 변경 (Selected Profile)
  const handleSkillSlotsChange = async (skillSlots: SkillSlotConfig[]) => {
    const selectedProfile = getSelectedProfile();
    const newProfiles = config.profiles.map(p =>
      p.id === selectedProfile.id ? { ...p, skillSlots } : p
    );
    const newConfig = { ...config, profiles: newProfiles };
    setConfig(newConfig);
    await window.electronAPI.configSave(newConfig);
  };

  // Ensure profiles exist and get selected profile
  const selectedProfile = (config.profiles && config.profiles.length > 0)
    ? getSelectedProfile()
    : null;

  return (
    <div className="app-container">
      <TitleBar />
      <MenuBar
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onLoad={handleLoad}
        onLanguageChange={handleLanguageChange}
        currentLanguage={config.language}
        currentFile={getTranslatedFileName(currentFilePath)}
        isOverlayInteractive={isOverlayInteractive}
        onToggleOverlayInteractive={handleToggleOverlayInteractive}
        onResetOverlay={handleResetOverlay}
      />

      <div className="main-content">
        <div className="left-panel">
          <ProfileList
            profiles={config.profiles || []}
            selectedProfileId={config.selectedProfileId || 'default'}
            status={status}
            onSelect={handleSelectProfile}
            onStart={handleStartProfile}
            onStop={handleStopProfile}
            onAdd={handleAddProfile}
            onDelete={handleDeleteProfile}
            onRename={handleRenameProfile}
            onKeyChange={handleKeyChange}
            onShowToast={showToast}
            disabled={status.state === 'running'}
          />
        </div>

        <div className="middle-panel">
          <SkillKeysGrid
            slots={selectedProfile?.skillSlots || []}
            onChange={handleSkillSlotsChange}
          />
        </div>

        <div className="right-panel">
          <StopKeysPanel
            config={config.stopKeys}
            onChange={async (stopKeys) => {
              const newConfig = { ...config, stopKeys };
              setConfig(newConfig);
              await window.electronAPI.configSave(newConfig);
            }}
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
