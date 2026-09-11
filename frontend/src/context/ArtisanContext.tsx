// Stores the currently signed-in artisan placeholder.
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Artisan } from '../types/product';
type ArtisanContextValue = { artisan: Artisan | null; setArtisan: (artisan: Artisan | null) => void };
const ArtisanContext = createContext<ArtisanContextValue | undefined>(undefined);
export function ArtisanProvider({ children }: { children: ReactNode }) { const [artisan, setArtisan] = useState<Artisan | null>(null); return <ArtisanContext.Provider value={{ artisan, setArtisan }}>{children}</ArtisanContext.Provider>; }
export function useArtisan() { const value = useContext(ArtisanContext); if (!value) throw new Error('useArtisan must be used inside ArtisanProvider'); return value; }