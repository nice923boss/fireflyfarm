import { useState } from 'react';
import { useSite } from './SiteContext';
import { RichBlocks } from './RichBlocks';

export function Faq() {
  const { content } = useSite();
  const data = content.faq;
  const [activeIndex, setActiveIndex] = useState(0);
  /** Open state keyed by `${categoryIndex}-${faqIndex}`; the first item of each category starts open. */
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const category = data.categories[activeIndex];
  const isOpen = (key: string, faqIndex: number) => open[key] ?? faqIndex === 0;
  const toggle = (key: string, faqIndex: number) =>
    setOpen((prev) => ({ ...prev, [key]: !isOpen(key, faqIndex) }));

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
          <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700 mb-4">{data.heading}</h3>
          <p className="font-serif font-bold text-forest-700 text-base sm:text-lg mb-3">{data.introTitle}</p>
          <p className="text-sm text-coffee-light leading-relaxed">{data.intro}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {data.categories.map((cat, i) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                i === activeIndex
                  ? 'bg-forest-700 text-white shadow-md scale-105'
                  : 'bg-cream border border-wood/60 text-coffee hover:bg-cream-200'
              }`}
            >
              {cat.icon} {cat.id}｜{cat.title}
            </button>
          ))}
        </div>

        {category && (
          <div key={category.id} className="animate-fadeIn">
            <div className="flex items-center space-x-3 pb-3 border-b border-wood/30 mb-6">
              <span className="text-3xl">{category.icon}</span>
              <div>
                <p className="text-xs uppercase tracking-widest text-caramel font-semibold">
                  {category.id}
                  {data.labels.categorySuffix}
                </p>
                <h4 className="text-xl sm:text-2xl font-serif font-bold text-forest-700">{category.title}</h4>
                <p className="text-xs text-coffee/80">{category.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4">
              {category.faqs.map((faq, faqIndex) => {
                const key = `${activeIndex}-${faqIndex}`;
                const expanded = isOpen(key, faqIndex);
                return (
                  <div
                    key={key}
                    className="border border-wood/70 rounded-2xl bg-cream shadow-sm hover:border-forest-600 transition-colors overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(key, faqIndex)}
                      aria-expanded={expanded}
                      className="w-full flex items-center justify-between px-6 py-5 text-left font-serif font-bold text-forest-700 text-base sm:text-lg"
                    >
                      <span>{faq.q}</span>
                      <span className="text-caramel text-xl font-mono ml-4">{expanded ? '−' : '+'}</span>
                    </button>
                    {expanded && (
                      <div className="px-6 pb-6 text-sm text-coffee border-t border-wood/30 pt-4 bg-white/60 animate-fadeIn">
                        <RichBlocks blocks={faq.blocks} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
