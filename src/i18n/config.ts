import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import koTranslation from '../locales/ko/translation.json';
import enTranslation from '../locales/en/translation.json';
import jaTranslation from '../locales/ja/translation.json';
import zhTranslation from '../locales/zh/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: koTranslation },
      en: { translation: enTranslation },
      ja: { translation: jaTranslation },
      zh: { translation: zhTranslation },
    },
    lng: 'ko', // 기본 언어
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
