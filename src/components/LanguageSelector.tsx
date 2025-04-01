
import React from 'react';
import { Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const languages = [
  { value: 'english', label: 'English' },
  { value: 'swedish', label: 'Svenska' },
  { value: 'chinese', label: '中文' },
  { value: 'spanish', label: 'Español' },
  { value: 'german', label: 'Deutsch' },
  { value: 'russian', label: 'Русский' }
];

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const handleValueChange = (value: string) => {
    setLanguage(value as Language);
  };
  
  return (
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-axiv-blue/10 flex items-center justify-center mr-3">
        <span className="text-axiv-blue"><Globe size={20} /></span>
      </div>
      
      <div className="flex-1">
        <h4 className="font-medium">{t('language')}</h4>
        <p className="text-axiv-gray text-sm">{t('languageDesc')}</p>
      </div>
      
      <Select value={language} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
