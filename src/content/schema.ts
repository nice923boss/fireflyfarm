import { z } from 'zod';

/**
 * Zod schemas for every content/*.json file.
 * The front-end only renders what these describe; the admin edits the same shapes.
 */

export const LinkRefSchema = z.object({
  label: z.string(),
  /** shared = key into site.links; url = literal href; anchor = section id; edm = edm item id */
  kind: z.enum(['shared', 'url', 'anchor', 'edm']),
  value: z.string(),
});
export type LinkRef = z.infer<typeof LinkRefSchema>;

export const ImageRefSchema = z.object({ src: z.string(), alt: z.string().default('') });
export type ImageRef = z.infer<typeof ImageRefSchema>;

export const GalleryImageSchema = z.object({ src: z.string(), caption: z.string().default('') });
export type GalleryImage = z.infer<typeof GalleryImageSchema>;

/* ---------- site.json ---------- */

export const SiteSchema = z.object({
  name: z.string(),
  nameEn: z.string(),
  tagline: z.string(),
  seo: z.object({ title: z.string(), description: z.string() }),
  links: z.record(z.string(), z.object({ label: z.string(), url: z.string() })),
  nav: z.array(z.object({ label: z.string(), target: z.string(), highlight: z.boolean().optional() })),
  headerButtons: z.object({ facebook: LinkRefSchema, line: LinkRefSchema, primary: LinkRefSchema }),
  hero: z.object({
    badge: z.string(),
    title: z.string(),
    subtitle: z.string(),
    image: ImageRefSchema,
    buttons: z.array(LinkRefSchema),
  }),
  footer: z.object({
    about: z.string(),
    contactTitle: z.string(),
    contactLines: z.array(z.object({ prefix: z.string(), link: LinkRefSchema.optional() })),
    quickLinksTitle: z.string(),
    quickLinks: z.array(LinkRefSchema),
    copyright: z.string(),
  }),
  floatingBar: z.array(
    z.object({
      icon: z.enum(['facebook', 'line', 'phone']),
      label: z.string(),
      kind: LinkRefSchema.shape.kind,
      value: z.string(),
    }),
  ),
});
export type SiteContent = z.infer<typeof SiteSchema>;

/* ---------- audiences.json ---------- */

export const AudiencesSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  cards: z.array(
    z.object({
      id: z.string(),
      icon: z.string(),
      title: z.string(),
      items: z.array(z.string()),
      button: LinkRefSchema,
    }),
  ),
});
export type AudiencesContent = z.infer<typeof AudiencesSchema>;

/* ---------- rooms.json ---------- */

export const RoomSchema = z.object({
  id: z.string(),
  category: z.string(),
  name: z.string(),
  desc: z.string(),
  priceNote: z.string(),
  image: ImageRefSchema,
  equipment: z.array(z.string()),
  gallery: z.array(GalleryImageSchema),
});
export type Room = z.infer<typeof RoomSchema>;

export const RoomsSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  intro: z.string(),
  labels: z.object({
    hoverBadge: z.string(),
    priceTitle: z.string(),
    equipmentTitle: z.string(),
    detailButton: z.string(),
    modalTitleSuffix: z.string(),
    modalGalleryTitle: z.string(),
    modalEquipmentTitle: z.string(),
    modalClose: z.string(),
  }),
  bookButton: LinkRefSchema,
  cards: z.array(RoomSchema),
});
export type RoomsContent = z.infer<typeof RoomsSchema>;

/* ---------- seasons.json ---------- */

export const SeasonSchema = z.object({
  id: z.string(),
  icon: z.string(),
  period: z.string(),
  title: z.string(),
  desc: z.string(),
  buttonLabel: z.string(),
  image: ImageRefSchema,
  gallery: z.array(GalleryImageSchema),
});
export type Season = z.infer<typeof SeasonSchema>;

export const SeasonsSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  intro: z.string(),
  labels: z.object({ modalGalleryTitle: z.string(), modalClose: z.string(), photoPrefix: z.string() }),
  cards: z.array(SeasonSchema),
});
export type SeasonsContent = z.infer<typeof SeasonsSchema>;

/* ---------- activities.json ---------- */

export const ActivitiesSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  cards: z.array(
    z.object({
      id: z.string(),
      icon: z.string(),
      title: z.string(),
      desc: z.string(),
      items: z.array(z.string()),
      notes: z.array(z.string()),
    }),
  ),
});
export type ActivitiesContent = z.infer<typeof ActivitiesSchema>;

/* ---------- transport.json ---------- */

export const TransportSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  intro: z.string(),
  navigation: z.object({ kicker: z.string(), title: z.string(), desc: z.string(), button: LinkRefSchema }),
  lists: z.array(
    z.object({
      id: z.string(),
      tone: z.enum(['amber', 'cream']),
      icon: z.string(),
      title: z.string(),
      steps: z.array(z.string()),
    }),
  ),
});
export type TransportContent = z.infer<typeof TransportSchema>;

/* ---------- faq.json ---------- */

export const BOX_TONES = ['cream', 'amber', 'red', 'emerald', 'sky'] as const;
export const P_TONES = ['normal', 'muted', 'note', 'accent', 'small'] as const;

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('p'), text: z.string(), tone: z.enum(P_TONES).optional() }),
  z.object({
    type: z.literal('box'),
    tone: z.enum(BOX_TONES),
    title: z.string().optional(),
    badge: z.string().optional(),
    badgeTone: z.enum(['caramel', 'forest']).optional(),
    lines: z.array(z.string()),
    list: z.boolean().optional(),
    note: z.string().optional(),
    button: LinkRefSchema.optional(),
  }),
  z.object({ type: z.literal('stats'), items: z.array(z.object({ label: z.string(), value: z.string() })) }),
  z.object({ type: z.literal('items'), items: z.array(z.object({ icon: z.string(), text: z.string() })) }),
  z.object({
    type: z.literal('contact'),
    rows: z.array(z.object({ label: z.string(), text: z.string(), kind: LinkRefSchema.shape.kind, value: z.string() })),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal('buttons'),
    buttons: z.array(LinkRefSchema.extend({ style: z.enum(['forest', 'emerald']).optional() })),
  }),
]);
export type Block = z.infer<typeof BlockSchema>;
export type BlockType = Block['type'];

export const FaqItemSchema = z.object({ q: z.string(), blocks: z.array(BlockSchema) });
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const FaqCategorySchema = z.object({
  id: z.string(),
  icon: z.string(),
  title: z.string(),
  subtitle: z.string(),
  faqs: z.array(FaqItemSchema),
});
export type FaqCategory = z.infer<typeof FaqCategorySchema>;

export const FaqSchema = z.object({
  kicker: z.string(),
  heading: z.string(),
  introTitle: z.string(),
  intro: z.string(),
  labels: z.object({ categorySuffix: z.string() }),
  categories: z.array(FaqCategorySchema),
});
export type FaqContent = z.infer<typeof FaqSchema>;

/* ---------- edm.json ---------- */

export const EdmItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  heading: z.string(),
  body: z.string(),
  priceTitle: z.string(),
  priceText: z.string(),
  image: ImageRefSchema,
  imagePlaceholder: z.string(),
  button: LinkRefSchema,
});
export type EdmItem = z.infer<typeof EdmItemSchema>;

export const EdmSchema = z.object({ badge: z.string(), closeLabel: z.string(), items: z.array(EdmItemSchema) });
export type EdmContent = z.infer<typeof EdmSchema>;

/* ---------- whole content bundle ---------- */

export const ContentSchema = z.object({
  site: SiteSchema,
  audiences: AudiencesSchema,
  rooms: RoomsSchema,
  seasons: SeasonsSchema,
  activities: ActivitiesSchema,
  transport: TransportSchema,
  faq: FaqSchema,
  edm: EdmSchema,
});
export type Content = z.infer<typeof ContentSchema>;
export type SectionKey = keyof Content;

export const SECTION_KEYS: SectionKey[] = ['site', 'audiences', 'rooms', 'seasons', 'activities', 'transport', 'faq', 'edm'];

/** Repository path of each section's JSON file (used by the admin when committing). */
export const SECTION_FILES: Record<SectionKey, string> = {
  site: 'content/site.json',
  audiences: 'content/audiences.json',
  rooms: 'content/rooms.json',
  seasons: 'content/seasons.json',
  activities: 'content/activities.json',
  transport: 'content/transport.json',
  faq: 'content/faq.json',
  edm: 'content/edm.json',
};
