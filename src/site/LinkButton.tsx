import type { ReactNode } from 'react';
import type { LinkRef } from '../content/schema';
import { resolveHref, scrollToSection } from '../lib/links';
import { useSite } from './SiteContext';

interface Props {
  link: Pick<LinkRef, 'kind' | 'value'>;
  className?: string;
  children: ReactNode;
  title?: string;
}

/**
 * Renders a LinkRef as the right element:
 * anchor -> <a href="#id"> with smooth scroll, edm -> <button> opening the EDM modal,
 * shared/url -> <a> (new tab for http(s), same tab for tel:/mailto:).
 */
export function LinkButton({ link, className, children, title }: Props) {
  const { content, actions } = useSite();

  if (link.kind === 'anchor') {
    return (
      <a
        href={`#${link.value}`}
        className={className}
        title={title}
        onClick={(e) => {
          e.preventDefault();
          scrollToSection(link.value);
        }}
      >
        {children}
      </a>
    );
  }

  if (link.kind === 'edm') {
    return (
      <button type="button" className={className} title={title} onClick={() => actions.openEdm(link.value)}>
        {children}
      </button>
    );
  }

  const resolved = resolveHref(link, content.site);
  if (!resolved) {
    return (
      <span className={className} title="連結尚未設定">
        {children}
      </span>
    );
  }
  return (
    <a
      href={resolved.href}
      className={className}
      title={title}
      target={resolved.external ? '_blank' : undefined}
      rel={resolved.external ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  );
}
