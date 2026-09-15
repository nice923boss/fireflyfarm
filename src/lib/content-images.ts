import type { Content } from '../content/schema';

/** Every image src string reachable in the content bundle (hero, rooms, seasons, edm). */
export function collectImageSrcs(content: Content): string[] {
  const out: string[] = [content.site.hero.image.src];
  for (const room of content.rooms.cards) {
    out.push(room.image.src, ...room.gallery.map((g) => g.src));
  }
  for (const season of content.seasons.cards) {
    out.push(season.image.src, ...season.gallery.map((g) => g.src));
  }
  for (const item of content.edm.items) out.push(item.image.src);
  return out.filter(Boolean);
}

/** Replaces image srcs via a mapping (used to swap staged blob URLs for repo paths). */
export function mapImageSrcs(content: Content, map: (src: string) => string): Content {
  const img = <T extends { src: string }>(ref: T): T => ({ ...ref, src: map(ref.src) });
  return {
    ...content,
    site: { ...content.site, hero: { ...content.site.hero, image: img(content.site.hero.image) } },
    rooms: {
      ...content.rooms,
      cards: content.rooms.cards.map((room) => ({
        ...room,
        image: img(room.image),
        gallery: room.gallery.map(img),
      })),
    },
    seasons: {
      ...content.seasons,
      cards: content.seasons.cards.map((season) => ({
        ...season,
        image: img(season.image),
        gallery: season.gallery.map(img),
      })),
    },
    edm: { ...content.edm, items: content.edm.items.map((item) => ({ ...item, image: img(item.image) })) },
  };
}
