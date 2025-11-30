import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'km' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1 sm:gap-2 h-8 px-2 sm:px-3"
    >
      <Languages className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="font-medium text-xs sm:text-sm">{language === 'en' ? 'ខ្មែរ' : 'EN'}</span>
    </Button>
  );
}
