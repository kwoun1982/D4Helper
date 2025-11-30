
import { useTranslation } from 'react-i18next';
import './MenuBar.css';

interface MenuBarProps {
  onSave: () => void;
  onLoad: () => void;
  onLanguageChange: (lang: 'ko' | 'en' | 'ja' | 'zh') => void;
  currentLanguage: string;
}

export default function MenuBar({ onSave, onLoad, onLanguageChange, currentLanguage }: MenuBarProps) {
  const { t } = useTranslation();

  return (
    <div className="menu-bar">
      <div className="menu-left">
        <span className="menu-label">{t('menu.file')}:</span>
        <button className="menu-icon-btn" onClick={onLoad} title={t('menu.load')}>
          📄
        </button>
        <button className="menu-icon-btn" onClick={onSave} title={t('menu.save')}>
          💾
        </button>
      </div>

      <div className="menu-right">
        <span className="menu-label">{t('menu.language')}:</span>
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
