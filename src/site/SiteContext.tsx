import { createContext, useContext } from 'react';
import type { Content } from '../content/schema';

export interface SiteActions {
  openEdm: (id: string) => void;
}

export interface SiteContextValue {
  content: Content;
  actions: SiteActions;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export const SiteProvider = SiteContext.Provider;

export function useSite(): SiteContextValue {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite must be used inside <SiteProvider>');
  return value;
}
