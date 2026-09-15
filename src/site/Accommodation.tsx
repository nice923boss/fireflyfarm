import type { Room } from '../content/schema';
import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';
import { Img } from './Img';

export function Accommodation({ onOpenRoom }: { onOpenRoom: (room: Room) => void }) {
  const { content } = useSite();
  const data = content.rooms;
  return (
    <section id="accommodation" className="py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-caramel font-semibold mb-3">{data.kicker}</h2>
            <h3 className="text-3xl sm:text-4xl font-serif font-bold text-forest-700">{data.heading}</h3>
          </div>
          <p className="text-sm text-coffee-light max-w-md">{data.intro}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.cards.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-wood flex flex-col"
            >
              <div
                className="h-56 bg-cream-200 relative group cursor-pointer overflow-hidden"
                onClick={() => onOpenRoom(room)}
              >
                <Img src={room.image.src} alt={room.image.alt || room.name} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-forest-700/90 text-white text-xs px-3 py-1 rounded-full">
                  {room.category}
                </span>
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-forest-700 text-xs font-semibold px-4 py-2 rounded-full">
                    {data.labels.hoverBadge}
                  </span>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <h4 className="font-serif font-bold text-xl text-forest-700 mb-2">{room.name}</h4>
                <p className="text-xs text-coffee-light mb-4 leading-relaxed">{room.desc}</p>

                <div className="bg-cream-50 p-3 rounded-xl border border-wood/60 mb-4">
                  <p className="text-xs font-semibold text-caramel mb-1">{data.labels.priceTitle}</p>
                  <p className="text-xs text-coffee">{room.priceNote}</p>
                </div>

                <p className="text-xs font-semibold text-forest-700 mb-2">{data.labels.equipmentTitle}</p>
                <ul className="text-xs space-y-1.5 max-h-28 overflow-y-auto pr-1 mb-4 text-coffee">
                  {room.equipment.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-forest-600 mr-1.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto space-y-2">
                  <button
                    type="button"
                    onClick={() => onOpenRoom(room)}
                    className="w-full py-2.5 bg-cream-200 text-forest-700 rounded-xl text-xs font-semibold border border-wood hover:bg-cream-100 transition-colors"
                  >
                    {data.labels.detailButton}
                  </button>
                  <LinkButton
                    link={data.bookButton}
                    className="block w-full text-center py-3 bg-forest-700 text-white rounded-xl text-sm font-semibold hover:bg-forest-800 transition-colors"
                  >
                    {data.bookButton.label}
                  </LinkButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
