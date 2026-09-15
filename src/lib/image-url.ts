const ABSOLUTE = /^(https?:|data:|blob:)/i;

/** Base path the site is served from (e.g. "/fireflyfarm/"). */
export function basePath(): string {
  return import.meta.env.BASE_URL;
}

/**
 * Turns a stored image reference into a browser URL.
 * Absolute/data/blob URLs pass through; repo-relative paths like "images/x.jpg" get the Vite base.
 */
export function imageUrl(src: string): string {
  if (!src) return placeholderUrl();
  if (ABSOLUTE.test(src)) return src;
  return basePath() + src.replace(/^\/+/, '');
}

export function placeholderUrl(): string {
  return basePath() + 'images/placeholder.svg';
}

/** True when the reference points at a file inside public/images (managed by the admin). */
export function isRepoImage(src: string): boolean {
  return src.startsWith('images/');
}
