// Boots the React application with its shared providers.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';
import { ArtisanProvider } from './context/ArtisanContext';
createRoot(document.getElementById('root')!).render(<StrictMode><LanguageProvider><ArtisanProvider><App /></ArtisanProvider></LanguageProvider></StrictMode>);