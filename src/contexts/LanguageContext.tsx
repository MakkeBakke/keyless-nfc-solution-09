
import React, { createContext, useState, useContext, useEffect } from 'react';
import translations, { TranslationKey } from '@/translations';

export type Language = 'english' | 'swedish' | 'chinese' | 'spanish' | 'german' | 'russian';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('english');

  useEffect(() => {
    // Check for saved language in local storage on mount
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Make sure English is the default if no valid language is saved
      localStorage.setItem('language', 'english');
    }
  }, []);

  useEffect(() => {
    // Save to local storage when language changes
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: TranslationKey): string => {
    const currentTranslations = translations[language];
    return currentTranslations[key] || translations.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
