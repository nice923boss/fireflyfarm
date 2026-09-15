import { Fragment } from 'react';
import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';
import { Img } from './Img';

const PRIMARY =
  'px-8 py-4 bg-forest-700 text-white rounded-full font-semibold shadow-lg hover:bg-forest-800 hover:-translate-y-0.5 transition-all text-center';
const SECONDARY =
  'px-8 py-4 bg-white/90 backdrop-blur border border-wood text-coffee rounded-full font-semibold hover:bg-white transition-all text-center';

export function Hero() {
  const { content } = useSite();
  const hero = content.site.hero;
  const titleLines = hero.title.split('\n');

  return (
    <section
      id="about"
      className="relative pt-20 min-h-screen flex items-center justify-center bg-cream overflow-hidden"
    >
      <div className="absolute inset-0">
        <Img src={hero.image.src} alt={hero.image.alt} className="w-full h-full object-cover opacity-20" loading="eager" />
        <div className="absolute inset-0 bg-linear-to-t from-cream via-transparent to-transparent" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        <span className="inline-block py-1.5 px-4 mb-6 rounded-full bg-cream-200 text-caramel border border-wood text-xs sm:text-sm font-medium">
          {hero.badge}
        </span>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-forest-700 tracking-tight leading-tight mb-6">
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {line}
              {i < titleLines.length - 1 && <br className="hidden sm:inline" />}
            </Fragment>
          ))}
        </h1>
        <p className="text-lg sm:text-xl text-coffee-light max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          {hero.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {hero.buttons.map((button, i) => (
            <LinkButton key={i} link={button} className={i === 0 ? PRIMARY : SECONDARY}>
              {button.label}
            </LinkButton>
          ))}
        </div>
      </div>
    </section>
  );
}
