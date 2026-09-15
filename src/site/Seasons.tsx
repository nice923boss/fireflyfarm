import type { Season } from '../content/schema';
import { useSite } from './SiteContext';
import { Img } from './Img';

export function Seasons({ onOpenSeason }: { onOpenSeason: (season: Season) => void }) {
  const { content } = useSite();
  const data = content.seasons;
  return (
    <section id="seasons" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700 mb-4">{data.heading}</h3>
          <p className="text-sm text-coffee-light max-w-2xl mx-auto">{data.intro}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.cards.map((season) => (
            <div
              key={season.id}
              className="bg-cream rounded-2xl border border-wood overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="h-48 relative overflow-hidden bg-cream-200">
                <Img
                  src={season.image.src}
                  alt={season.image.alt || season.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 text-2xl bg-white/80 p-1.5 rounded-xl backdrop-blur">
                  {season.icon}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-xs font-semibold text-caramel mb-1">{season.period}</p>
                <h4 className="font-serif font-bold text-lg text-forest-700 mb-2">{season.title}</h4>
                <p className="text-xs text-coffee-light leading-relaxed mb-5">{season.desc}</p>
                <button
                  type="button"
                  onClick={() => onOpenSeason(season)}
                  className="mt-auto w-full py-3 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors flex items-center justify-between px-4"
                >
                  <span>{season.buttonLabel}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
