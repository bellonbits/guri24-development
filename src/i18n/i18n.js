import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import soTranslations from './locales/so.json';
import { getSomaliTranslations } from './translateService';

const savedLang = (() => {
    try { return localStorage.getItem('guri24_lang') || 'en'; }
    catch { return 'en'; }
})();

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            so: { translation: soTranslations },
        },
        lng: savedLang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

// Hydrate Somali with Google Translate in the background
getSomaliTranslations(enTranslations)
    .then((translated) => {
        i18n.addResourceBundle('so', 'translation', translated, true, true);
        if (i18n.language === 'so') {
            i18n.changeLanguage('so');
        }
    })
    .catch(() => {
        // Network unavailable — static so.json stays active
    });

export default i18n;
