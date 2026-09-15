import { useState } from 'react';
import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';
import { scrollToSection } from '../lib/links';

export function Header() {
  const { content } = useSite();
  const site = content.site;
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (target: string) => {
    setMenuOpen(false);
    scrollToSection(target);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/90 backdrop-blur-md border-b border-wood/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a
          href="#about"
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            go('about');
          }}
        >
          <span className="text-2xl font-serif font-bold text-forest-700 tracking-wider">{site.name}</span>
          <span className="text-xs uppercase tracking-widest text-caramel hidden sm:inline-block border-l border-wood/60 pl-2">
            {site.nameEn}
          </span>
        </a>

        <nav className="hidden lg:flex space-x-5 text-sm">
          {site.nav.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              onClick={(e) => {
                e.preventDefault();
                go(item.target);
              }}
              className={
                item.highlight
                  ? 'text-forest-700 font-bold hover:text-forest-800 transition-colors'
                  : 'text-coffee hover:text-forest-700 transition-colors'
              }
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <LinkButton
            link={site.headerButtons.facebook}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs border border-blue-600 text-blue-700 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
          >
            {site.headerButtons.facebook.label}
          </LinkButton>
          <LinkButton
            link={site.headerButtons.line}
            className="hidden sm:inline-flex px-3 py-1.5 text-xs border border-forest-700 text-forest-700 rounded-full hover:bg-forest-700 hover:text-white transition-colors"
          >
            {site.headerButtons.line.label}
          </LinkButton>
          <LinkButton
            link={site.headerButtons.primary}
            className="px-4 py-2 bg-forest-700 text-white rounded-full text-sm font-semibold shadow-md hover:bg-forest-800 transition-colors"
          >
            {site.headerButtons.primary.label}
          </LinkButton>
          <button
            type="button"
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full text-forest-700 hover:bg-cream-200"
            aria-label="開啟選單"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden bg-cream border-t border-wood/40 px-4 py-3 flex flex-col space-y-1 text-sm">
          {site.nav.map((item) => (
            <a
              key={item.target}
              href={`#${item.target}`}
              onClick={(e) => {
                e.preventDefault();
                go(item.target);
              }}
              className={`py-2 ${item.highlight ? 'text-forest-700 font-bold' : 'text-coffee'}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
