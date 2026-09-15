import { useSite } from './SiteContext';
import { Inline } from './Inline';

export function Activities() {
  const { content } = useSite();
  const data = content.activities;
  return (
    <section id="activities" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700">{data.heading}</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {data.cards.map((card) => (
            <div key={card.id} className="bg-white p-8 rounded-3xl border border-wood shadow-sm">
              <span className="text-3xl mb-4 block">{card.icon}</span>
              <h4 className="text-2xl font-serif font-bold text-forest-700 mb-3">{card.title}</h4>
              <p className="text-sm text-coffee-light leading-relaxed mb-6">
                <Inline text={card.desc} boldClass="font-bold text-forest-700" />
              </p>
              <ul className="space-y-3 text-sm text-coffee mb-6">
                {card.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-2 h-2 rounded-full bg-caramel mt-1.5 mr-3 shrink-0" />
                    <span>
                      <Inline text={item} />
                    </span>
                  </li>
                ))}
              </ul>
              {card.notes.length > 0 && (
                <div className="bg-cream p-4 rounded-2xl border border-wood/70 text-xs text-coffee-light space-y-2">
                  {card.notes.map((note, i) => (
                    <p key={i}>
                      <Inline text={note} />
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
