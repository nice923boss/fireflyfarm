import site from '../../content/site.json';
import audiences from '../../content/audiences.json';
import rooms from '../../content/rooms.json';
import seasons from '../../content/seasons.json';
import activities from '../../content/activities.json';
import transport from '../../content/transport.json';
import faq from '../../content/faq.json';
import edm from '../../content/edm.json';
import { ContentSchema, type Content } from './schema';

/** Parsed and validated content bundled at build time. Throws at startup if a JSON file is malformed. */
export function loadBundledContent(): Content {
  return ContentSchema.parse({ site, audiences, rooms, seasons, activities, transport, faq, edm });
}

export * from './schema';
