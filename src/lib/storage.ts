/**
 * Browser-side persistence for the admin.
 * Token: sessionStorage only (cleared when the tab closes). Drafts: localStorage.
 */

const TOKEN_KEY = 'fireflyfarm.admin.token';
const DRAFT_KEY = 'fireflyfarm.admin.draft';

export function loadToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export interface DraftRecord<T> {
  savedAt: string;
  data: T;
}

export function loadDraft<T>(): DraftRecord<T> | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as DraftRecord<T>) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(data: T): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: new Date().toISOString(), data }));
  } catch {
    /* quota or private mode: drafts are a convenience only */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

const REPO_KEY = 'fireflyfarm.admin.repo';

export interface StoredRepo {
  owner: string;
  repo: string;
  branch: string;
}

export const DEFAULT_REPO: StoredRepo = { owner: 'nice923boss', repo: 'fireflyfarm', branch: 'main' };

/** Repo coordinates are public information, so localStorage is fine. */
export function loadRepoConfig(): StoredRepo {
  try {
    const raw = localStorage.getItem(REPO_KEY);
    if (!raw) return DEFAULT_REPO;
    const parsed = JSON.parse(raw) as Partial<StoredRepo>;
    return { ...DEFAULT_REPO, ...parsed };
  } catch {
    return DEFAULT_REPO;
  }
}

export function saveRepoConfig(repo: StoredRepo): void {
  try {
    localStorage.setItem(REPO_KEY, JSON.stringify(repo));
  } catch {
    /* ignore */
  }
}
