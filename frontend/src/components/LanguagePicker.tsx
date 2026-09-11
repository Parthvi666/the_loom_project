// Lets the user switch the interface language.
import { useLanguage } from '../context/LanguageContext';
export function LanguagePicker() { const { language, setLanguage } = useLanguage(); return <select value={language} onChange={event => setLanguage(event.target.value)}><option>English</option><option>Hindi</option></select>; }