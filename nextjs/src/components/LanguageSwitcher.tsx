'use client';

import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/navigation';
import { useTransition, useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hu', name: 'Magyar' }
  // Easy to add more languages:
  // { code: 'de', name: 'Deutsch' },
  // { code: 'fr', name: 'Français' },
  // { code: 'es', name: 'Español' },
  // { code: 'it', name: 'Italiano' }
];

interface LanguageSwitcherProps {
  variant?: 'select' | 'buttons';
  className?: string;
}

export function LanguageSwitcher({ variant = 'select', className = '' }: LanguageSwitcherProps) {
  const locale = useLocale();
  const router = useNextRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const switchLanguage = (newLocale: string) => {
    startTransition(() => {
      // Extract the path without the current locale prefix
      const currentPath = pathname;
      const pathWithoutLocale = currentPath.replace(/^\/(en|hu)/, '') || '/';
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      
      // Use Next.js router to navigate
      router.push(newPath);
    });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (variant === 'buttons') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/20 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors backdrop-blur-sm"
        >
          <span>{locale.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                disabled={isPending}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors first:rounded-t-md last:rounded-b-md ${
                  locale === lang.code ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );  }

  // Homepage variant - Native HTML select for compatibility
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select 
        value={locale} 
        onChange={(e) => switchLanguage(e.target.value)}
        disabled={isPending}
        className="px-3 py-2 text-sm border border-input rounded-md bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
