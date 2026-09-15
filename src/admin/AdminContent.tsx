import { createContext, useContext } from 'react';
import type { Content } from '../content/schema';

export interface StagedImage {
  /** Final repo path relative to public/, e.g. images/1726-photo.jpg */
  repoPath: string;
  blob: Blob;
}

export interface AdminContentValue {
  content: Content;
  /** Compresses and stages a picked file; returns the blob: URL to store in the draft until save. */
  stageImage: (file: File) => Promise<string>;
}

const AdminContentContext = createContext<AdminContentValue | null>(null);
export const AdminContentProvider = AdminContentContext.Provider;

export function useAdminContent(): AdminContentValue {
  const value = useContext(AdminContentContext);
  if (!value) throw new Error('useAdminContent must be used inside <AdminContentProvider>');
  return value;
}
