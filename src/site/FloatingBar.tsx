import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';

const ICONS = {
  facebook: {
    className: 'w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform',
    svgClass: 'w-6 h-6',
    path: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z',
  },
  line: {
    className: 'w-14 h-14 rounded-full bg-emerald-600 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform',
    svgClass: 'w-7 h-7',
    path: 'M12 2C6.48 2 2 6.03 2 11c0 2.87 1.48 5.41 3.77 7.07-.15.82-.77 2.97-.88 3.39-.21.84.31 1.25.9.82 2.31-1.39 4.35-2.61 5.34-3.23.63.1 1.28.16 1.97.16 5.52 0 10-4.03 10-9s-4.48-9-10-9z',
  },
  phone: {
    className: 'w-14 h-14 rounded-full bg-forest-700 text-white shadow-2xl flex items-center justify-center hover:scale-105 transition-transform',
    svgClass: 'w-6 h-6',
    path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  },
} as const;

export function FloatingBar() {
  const { content } = useSite();
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
      {content.site.floatingBar.map((item, i) => {
        const icon = ICONS[item.icon];
        return (
          <LinkButton key={i} link={item} className={icon.className} title={item.label}>
            <svg className={icon.svgClass} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d={icon.path} />
            </svg>
            <span className="sr-only">{item.label}</span>
          </LinkButton>
        );
      })}
    </div>
  );
}
