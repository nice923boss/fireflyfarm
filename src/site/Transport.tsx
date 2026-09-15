import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';
import { Inline } from './Inline';

const TONE = {
  amber: {
    box: 'bg-amber-50/80 p-6 sm:p-8 rounded-3xl border border-amber-200',
    title: 'text-amber-900',
    circle: 'bg-amber-700',
  },
  cream: {
    box: 'bg-cream p-6 sm:p-8 rounded-3xl border border-wood',
    title: 'text-forest-700',
    circle: 'bg-forest-700',
  },
} as const;

export function Transport() {
  const { content } = useSite();
  const data = content.transport;
  return (
    <section id="transport" className="py-24 bg-white border-y border-wood">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700 mb-4">{data.heading}</h3>
          <p className="text-sm text-coffee-light">{data.intro}</p>
        </div>

        <div className="bg-cream p-6 sm:p-8 rounded-3xl border border-wood flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-caramel mb-1">{data.navigation.kicker}</p>
            <h4 className="font-serif font-bold text-xl text-forest-700 mb-1">{data.navigation.title}</h4>
            <p className="text-xs text-coffee-light">{data.navigation.desc}</p>
          </div>
          <LinkButton
            link={data.navigation.button}
            className="px-6 py-3.5 bg-forest-700 text-white rounded-xl text-sm font-semibold shadow-md hover:bg-forest-800 transition-colors whitespace-nowrap"
          >
            {data.navigation.button.label}
          </LinkButton>
        </div>

        <div className="space-y-6">
          {data.lists.map((list) => {
            const tone = TONE[list.tone];
            return (
              <div key={list.id} className={tone.box}>
                <h3 className={`font-serif font-bold text-lg mb-4 flex items-center ${tone.title}`}>
                  <span className="mr-2">{list.icon}</span>
                  {list.title}
                </h3>
                <ol className="space-y-3 text-sm text-coffee">
                  {list.steps.map((step, i) => (
                    <li key={i} className="flex items-start">
                      <span
                        className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center mr-3 shrink-0 font-bold ${tone.circle}`}
                      >
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">
                        <Inline text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
