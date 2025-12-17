
import { useTranslation } from 'react-i18next';
import './MenuBar.css';

interface MenuBarProps {
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: () => void;
  onLanguageChange: (lang: 'ko' | 'en' | 'ja' | 'zh') => void;
  currentLanguage: string;
  currentFile?: string;
  isOverlayInteractive?: boolean;
  onToggleOverlayInteractive?: () => void;
  onResetOverlay?: () => void;
}

export default function MenuBar({ onSave, onSaveAs, onLoad, onLanguageChange, currentLanguage, currentFile = '기본 설정', onResetOverlay }: MenuBarProps) {
  const { t } = useTranslation();

  return (
    <div className="menu-bar">
      <div className="menu-left">
        <span className="menu-label">{t('menu.file')}:</span>
        <button className="menu-icon-btn" onClick={onLoad} title={t('menu.load')}>
          📄 {t('menu.load')}
        </button>
        <button className="menu-icon-btn" onClick={onSave} title={t('menu.save')}>
          💾 {t('menu.save')}
        </button>
        <button className="menu-icon-btn" onClick={onSaveAs} title={t('menu.saveAs')}>
          💾+ {t('menu.saveAs')}
        </button>
        {onResetOverlay && (
          <button
            className="menu-icon-btn"
            onClick={onResetOverlay}
            title={t('menu.resetLayout')}
          >
            <span style={{ color: '#ff6b6b', marginRight: '4px', fontWeight: 'bold' }}>↺</span> {t('menu.resetLayout')}
          </button>
        )}
      </div>

      <div className="menu-center">
        <span className="file-indicator">{currentFile}</span>
      </div>

      <div className="menu-right">
        <div className="spacer"></div>
        <select
          className="language-select"
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as 'ko' | 'en' | 'ja' | 'zh')}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
          <option value="zh">简体中文</option>
        </select>
      </div>
    </div>
  );
}
