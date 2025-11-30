import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TitleBar from './components/TitleBar';
import MenuBar from './components/MenuBar';
import StartStopPanel from './components/StartStopPanel';
import StopKeysPanel from './components/StopKeysPanel';
import SkillKeysGrid from './components/SkillKeysGrid';
import { AppConfig, MacroStatus, DEFAULT_CONFIG } from './types';
import './App.css';

function App() {
  const { i18n } = useTranslation();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<MacroStatus>({ state: 'stopped', activeSlots: [] });

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

  // 설정 저장
  const handleSave = async () => {
    const result = await window.electronAPI.configSave(config);
    if (result.success) {
      console.log('Config saved successfully');
    }
  };

  // 설정 불러오기
  const handleLoad = async () => {
    const loadedConfig = await window.electronAPI.configLoad();
    setConfig(loadedConfig);
    i18n.changeLanguage(loadedConfig.language);
  };

  // 언어 변경
  const handleLanguageChange = (lang: 'ko' | 'en' | 'ja' | 'zh') => {
    i18n.changeLanguage(lang);
    setConfig({ ...config, language: lang });
  };

  // 매크로 시작
  const handleStart = async () => {
    await window.electronAPI.macroStart();
  };

  // 매크로 정지
  const handleStop = async () => {
    await window.electronAPI.macroStop();
  };

  // 단축키 변경 (자동 저장)
  const handleKeyChange = async (key: string) => {
    const newConfig = { ...config, startStopKey: key };
    setConfig(newConfig);
    // 즉시 저장하여 글로벌 단축키 재등록
    const result = await window.electronAPI.configSave(newConfig);
    if (result.success) {
      console.log('Start/Stop key changed and saved:', key);
    }
  };

  // 스킬 슬롯 변경 (자동 저장)
  const handleSkillSlotsChange = async (skillSlots: any) => {
    const newConfig = { ...config, skillSlots };
    setConfig(newConfig);
    // 즉시 저장
    const result = await window.electronAPI.configSave(newConfig);
    if (result.success) {
      console.log('Skill slots saved');
    }
  };

  return (
    <div className="app-container">
      <TitleBar />
      <MenuBar
        onSave={handleSave}
        onLoad={handleLoad}
        onLanguageChange={handleLanguageChange}
        currentLanguage={config.language}
      />

      <div className="main-content">
        <div className="left-panel">
          <StartStopPanel
            status={status}
            onStart={handleStart}
            onStop={handleStop}
            startStopKey={config.startStopKey}
            onKeyChange={handleKeyChange}
          />
          <StopKeysPanel
            config={config.stopKeys}
            onChange={async (stopKeys) => {
              const newConfig = { ...config, stopKeys };
              setConfig(newConfig);
              await window.electronAPI.configSave(newConfig);
            }}
          />
        </div>

        <div className="right-panel">
          <SkillKeysGrid
            slots={config.skillSlots}
            onChange={handleSkillSlotsChange}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
