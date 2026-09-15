import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';

export function Audiences() {
  const { content } = useSite();
  const data = content.audiences;
  return (
    <section id="audiences" className="py-20 bg-cream-200 border-y border-wood">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700">{data.heading}</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.cards.map((card) => (
            <div
              key={card.id}
              className="p-6 rounded-2xl bg-cream border border-wood hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h4 className="font-serif font-bold text-xl text-forest-700 mb-3">{card.title}</h4>
                <ul className="text-xs space-y-2 mb-6 border-t border-wood/30 pt-3">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-caramel mr-1.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <LinkButton
                link={card.button}
                className="w-full py-2.5 px-4 bg-forest-700 text-white rounded-xl text-xs font-semibold hover:bg-forest-800 transition-colors text-center block"
              >
                {card.button.label}
              </LinkButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
