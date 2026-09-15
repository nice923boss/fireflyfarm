import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';

export function Footer() {
  const { content } = useSite();
  const site = content.site;
  const footer = site.footer;
  return (
    <footer className="bg-forest-900 text-cream-200 py-16 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            <p className="text-2xl font-serif font-bold text-white tracking-wider mb-1">{site.name}</p>
            <p className="text-xs uppercase tracking-widest text-wood-light mb-4">{site.nameEn}</p>
            <p className="text-sm text-wood-light leading-relaxed">{footer.about}</p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-white mb-4">{footer.contactTitle}</h4>
            <ul className="text-sm space-y-2 text-wood-light">
              {footer.contactLines.map((line, i) => (
                <li key={i}>
                  {line.prefix}
                  {line.link && (
                    <LinkButton
                      link={line.link}
                      className={`underline text-wood-light hover:text-white ${line.link.value === 'line' ? 'font-mono' : ''}`}
                    >
                      {line.link.label}
                    </LinkButton>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-white mb-4">{footer.quickLinksTitle}</h4>
            <ul className="text-sm space-y-2">
              {footer.quickLinks.map((link, i) => (
                <li key={i}>
                  <LinkButton link={link} className="underline text-wood-light hover:text-white">
                    {link.label}
                  </LinkButton>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-forest-800 pt-8 text-xs text-wood-light/60 text-center space-y-1">
          <p>{footer.copyright}</p>
          <p className="text-[11px] text-wood-light/40">製作者：黃政文</p>
        </div>
      </div>
    </footer>
  );
}
