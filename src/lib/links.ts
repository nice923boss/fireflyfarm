import type { LinkRef, SiteContent } from '../content/schema';

export interface ResolvedHref {
  href: string;
  external: boolean;
}

/** Resolves shared/url link kinds to a concrete href. Anchor and EDM kinds are handled by the UI. */
export function resolveHref(ref: Pick<LinkRef, 'kind' | 'value'>, site: SiteContent): ResolvedHref | null {
  if (ref.kind === 'shared') {
    const target = site.links[ref.value];
    if (!target) return null;
    return { href: target.url, external: isExternal(target.url) };
  }
  if (ref.kind === 'url') return { href: ref.value, external: isExternal(ref.value) };
  return null;
}

export function isExternal(url: string): boolean {
  return /^https?:/i.test(url);
}

export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (element) element.scrollIntoView({ behavior: 'smooth' });
}
