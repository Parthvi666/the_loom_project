// Stores the selected interface language and resolves UI copy from locale files.
import { createContext, useContext, useState, type ReactNode } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import gu from '../i18n/gu.json';
type Locale = Record<string, string>;
type LanguageContextValue = { language: string; setLanguage: (language: string) => void; t: (key: string) => string };
const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const locales: Record<string, Locale> = { en, hi, gu };
export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguage] = useState(localStorage.getItem('loom_language') ?? 'en');
	const changeLanguage = (value: string) => { setLanguage(value); localStorage.setItem('loom_language', value); };
	const t = (key: string) => locales[language]?.[key] ?? locales.en[key] ?? key;
	return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error('useLanguage must be used inside LanguageProvider'); return value; }