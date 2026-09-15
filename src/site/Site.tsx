import { useCallback, useMemo, useState } from 'react';
import type { Content, Room, Season } from '../content/schema';
import { SiteProvider, type SiteContextValue } from './SiteContext';
import { Header } from './Header';
import { Hero } from './Hero';
import { Audiences } from './Audiences';
import { Accommodation } from './Accommodation';
import { Seasons } from './Seasons';
import { Activities } from './Activities';
import { Transport } from './Transport';
import { Faq } from './Faq';
import { Footer } from './Footer';
import { FloatingBar } from './FloatingBar';
import { EdmModal, RoomModal, SeasonModal } from './Modals';

/** The whole public page. Also used inside the admin preview with draft content. */
export function Site({ content }: { content: Content }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [edmId, setEdmId] = useState<string | null>(null);

  const openEdm = useCallback((id: string) => setEdmId(id), []);
  const value = useMemo<SiteContextValue>(() => ({ content, actions: { openEdm } }), [content, openEdm]);
  const edmItem = edmId ? content.edm.items.find((item) => item.id === edmId) : undefined;

  const closeRoom = useCallback(() => setRoom(null), []);
  const closeSeason = useCallback(() => setSeason(null), []);
  const closeEdm = useCallback(() => setEdmId(null), []);

  return (
    <SiteProvider value={value}>
      <div className="font-sans text-coffee bg-cream min-h-screen">
        <Header />
        <main>
          <Hero />
          <Audiences />
          <Accommodation onOpenRoom={setRoom} />
          <Seasons onOpenSeason={setSeason} />
          <Activities />
          <Transport />
          <Faq />
        </main>
        <Footer />
        <FloatingBar />
        {room && <RoomModal room={room} onClose={closeRoom} />}
        {season && <SeasonModal season={season} onClose={closeSeason} />}
        {edmItem && <EdmModal item={edmItem} onClose={closeEdm} />}
      </div>
    </SiteProvider>
  );
}
