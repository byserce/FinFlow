'use client';

import React, { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import en from '../../locales/en.json';
import tr from '../../locales/tr.json';

type Language = 'en' | 'tr';

type Translations = { [key: string]: string };

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: { [key in Language]: Translations } = { en, tr };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && ['en', 'tr'].includes(storedLanguage)) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };
  
  const t = (key: string, params?: { [key: string]: string | number }): string => {
    let translation = dictionaries[language][key] || key;
     if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }
    return translation;
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    translations: dictionaries[language],
    t,
  }), [language]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

    