import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightContent?: React.ReactNode;
  transparent?: boolean;
  dark?: boolean;
}
const Header = ({
  title,
  showBackButton = false,
  rightContent,
  transparent = false,
  dark = false
}: HeaderProps) => {
  const navigate = useNavigate();
  const {
    t,
    language,
    setLanguage
  } = useLanguage();
  const handleBack = () => {
    navigate(-1);
  };
  const languages = [{
    value: 'english',
    label: 'English'
  }, {
    value: 'swedish',
    label: 'Svenska'
  }, {
    value: 'chinese',
    label: '中文'
  }, {
    value: 'spanish',
    label: 'Español'
  }, {
    value: 'german',
    label: 'Deutsch'
  }, {
    value: 'russian',
    label: 'Русский'
  }];
  return <header className={cn("fixed top-0 left-0 right-0 z-40 py-4 px-6", transparent ? "bg-transparent" : "bg-background/80 backdrop-blur-md", "transition-all duration-300 ease-in-out")}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && <button onClick={handleBack} className={cn("p-2 rounded-full", dark ? "hover:bg-white/10" : "hover:bg-axiv-blue/10", "transition-colors")} aria-label="Back">
              <ChevronLeft className={cn("w-6 h-6", dark ? "text-white" : "text-axiv-dark")} />
              <span className="sr-only">{t('back')}</span>
            </button>}
          
          
        </div>
        
        {rightContent ? <div>
            {rightContent}
          </div> : <DropdownMenu>
            <DropdownMenuTrigger className={cn("p-2 rounded-full flex items-center justify-center", dark ? "hover:bg-white/10 text-white" : "hover:bg-axiv-blue/10 text-axiv-dark")}>
              <Globe className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map(lang => <DropdownMenuItem key={lang.value} className={cn("cursor-pointer", language === lang.value && "font-bold")} onClick={() => setLanguage(lang.value as any)}>
                  {lang.label}
                </DropdownMenuItem>)}
            </DropdownMenuContent>
          </DropdownMenu>}
      </div>
    </header>;
};
export default Header;