import { create } from 'zustand';
import { Language, translations } from '../i18n/translations';

interface LanguageState {
  language: Language;
  t: typeof translations['tr'];
  setLanguage: (lang: Language) => void;
}

const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('nexus_lang') as Language;
  if (saved && (saved === 'tr' || saved === 'en')) return saved;
  // Default to Turkish as primary user preference
  return 'tr';
};

const initialLang = getInitialLanguage();

export const useLanguageStore = create<LanguageState>((set) => ({
  language: initialLang,
  t: translations[initialLang],
  setLanguage: (lang) => {
    localStorage.setItem('nexus_lang', lang);
    set({ language: lang, t: translations[lang] });
  },
}));
