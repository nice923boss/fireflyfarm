import { useEffect, type ReactNode } from 'react';
import type { EdmItem, Room, Season } from '../content/schema';
import { useSite } from './SiteContext';
import { LinkButton } from './LinkButton';
import { Img } from './Img';

function ModalShell({ onClose, children, maxWidth = 'max-w-3xl' }: { onClose: () => void; children: ReactNode; maxWidth?: string }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-3xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="關閉"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-cream text-coffee flex items-center justify-center hover:bg-cream-200 transition-colors"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

export function RoomModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const { content } = useSite();
  const labels = content.rooms.labels;
  return (
    <ModalShell onClose={onClose}>
      <span className="inline-block bg-forest-50 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
        {room.category}
      </span>
      <h3 className="text-2xl font-serif font-bold text-forest-700 mb-2 pr-10">
        {room.name}
        {labels.modalTitleSuffix}
      </h3>
      <p className="text-sm text-coffee-light mb-6">{room.desc}</p>

      <h4 className="font-serif font-bold text-forest-700 mb-3">{labels.modalGalleryTitle}</h4>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
        {room.gallery.map((photo, i) => (
          <div key={i} className="relative h-40 rounded-xl border border-wood overflow-hidden bg-cream-200">
            <Img src={photo.src} alt={photo.caption || room.name} className="w-full h-full object-cover" />
            {photo.caption && (
              <span className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-lg truncate">
                {photo.caption}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-cream p-4 rounded-2xl border border-wood mb-6">
        <h4 className="font-serif font-bold text-forest-700 mb-3">{labels.modalEquipmentTitle}</h4>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-coffee">
          {room.equipment.map((item, i) => (
            <li key={i} className="flex items-start">
              <span className="text-forest-600 mr-1.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-wood text-coffee text-sm font-semibold hover:bg-cream transition-colors"
        >
          {labels.modalClose}
        </button>
        <LinkButton
          link={content.rooms.bookButton}
          className="flex-1 py-3 rounded-xl bg-forest-700 text-white text-sm font-semibold text-center hover:bg-forest-800 transition-colors"
        >
          立即預約此房型
        </LinkButton>
      </div>
    </ModalShell>
  );
}

export function SeasonModal({ season, onClose }: { season: Season; onClose: () => void }) {
  const { content } = useSite();
  const labels = content.seasons.labels;
  return (
    <ModalShell onClose={onClose}>
      <span className="inline-block text-caramel bg-cream-200 text-xs font-semibold px-3 py-1 rounded-full mb-3">
        {season.period}
      </span>
      <h3 className="text-2xl font-serif font-bold text-forest-700 mb-2 pr-10">
        {season.icon} {season.title}
      </h3>
      <p className="text-sm text-coffee-light mb-6">{season.desc}</p>

      <h4 className="font-serif font-bold text-forest-700 mb-3">{labels.modalGalleryTitle}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {season.gallery.map((photo, i) => (
          <div key={i} className="relative h-32 rounded-xl border border-wood overflow-hidden bg-cream-200">
            <Img src={photo.src} alt={photo.caption || `${season.title} ${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
              {photo.caption || `${labels.photoPrefix}${i + 1}`}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800 transition-colors"
      >
        {labels.modalClose}
      </button>
    </ModalShell>
  );
}

export function EdmModal({ item, onClose }: { item: EdmItem; onClose: () => void }) {
  const { content } = useSite();
  const edm = content.edm;
  return (
    <ModalShell onClose={onClose} maxWidth="max-w-2xl">
      <span className="inline-block bg-forest-50 text-forest-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
        {edm.badge}
      </span>
      <h3 className="text-2xl font-serif font-bold text-forest-700 mb-5 pr-10">📄 {item.title}</h3>

      <div className="bg-cream p-6 rounded-2xl border border-wood space-y-4 text-sm text-coffee mb-6">
        <h4 className="font-serif font-bold text-forest-700 text-lg">{item.heading}</h4>
        <p className="leading-relaxed">{item.body}</p>
        <div className="bg-white p-4 rounded-xl border border-wood/60">
          <p className="font-bold text-forest-700 mb-1">{item.priceTitle}</p>
          <p className="text-xs text-coffee-light">{item.priceText}</p>
        </div>
        {item.image.src ? (
          <Img src={item.image.src} alt={item.image.alt} className="w-full rounded-xl border border-wood/60" />
        ) : (
          <div className="h-48 bg-cream-200 rounded-xl flex items-center justify-center italic text-xs text-coffee-light">
            {item.imagePlaceholder}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl border border-wood text-coffee text-sm font-semibold hover:bg-cream transition-colors"
        >
          {edm.closeLabel}
        </button>
        <LinkButton
          link={item.button}
          className="flex-1 py-3 rounded-xl bg-forest-700 text-white text-sm font-semibold text-center hover:bg-forest-800 transition-colors"
        >
          {item.button.label}
        </LinkButton>
      </div>
    </ModalShell>
  );
}
