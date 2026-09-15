import { describe, expect, it } from 'vitest';
import { loadBundledContent, SECTION_KEYS } from '../src/content';
import { SECTION_ANCHORS } from '../src/admin/form/LinkRefField';

const content = loadBundledContent();

/** Every {kind, value} link-like object anywhere in the content tree. */
function collectLinks(node: unknown, out: Array<{ kind: string; value: string; path: string }> = [], path = ''): typeof out {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collectLinks(item, out, `${path}[${i}]`));
  } else if (node && typeof node === 'object') {
    const record = node as Record<string, unknown>;
    if (typeof record.kind === 'string' && typeof record.value === 'string') {
      out.push({ kind: record.kind, value: record.value, path });
    }
    for (const [key, child] of Object.entries(record)) collectLinks(child, out, `${path}.${key}`);
  }
  return out;
}

describe('bundled content', () => {
  it('parses every section through the zod schema', () => {
    for (const key of SECTION_KEYS) expect(content[key]).toBeDefined();
  });

  it('keeps the original faq.html item counts', () => {
    expect(content.audiences.cards).toHaveLength(4);
    expect(content.rooms.cards.map((r) => r.name)).toEqual(['飛螢農莊 (包棟)', '三合院區', '山上住久', '山上住久・小木屋']);
    expect(content.seasons.cards).toHaveLength(4);
    expect(content.activities.cards).toHaveLength(2);
    expect(content.transport.lists).toHaveLength(2);
    expect(content.faq.categories.map((c) => [c.id, c.faqs.length])).toEqual([
      ['01', 4],
      ['02', 5],
      ['03', 4],
      ['04', 3],
      ['05', 3],
      ['06', 2],
      ['07', 2],
    ]);
    expect(content.edm.items.map((e) => e.id)).toEqual(['school', 'corporate']);
  });

  it('has the shared links the buttons rely on', () => {
    expect(Object.keys(content.site.links)).toEqual(['line', 'facebook', 'maps', 'phone_mobile', 'phone_office']);
    expect(content.site.links.line.url).toBe('https://page.line.me/xat.0000109878.m4f?oat_content=url&openQrModal=true');
    expect(content.site.links.phone_mobile.url).toMatch(/^tel:/);
    expect(content.site.links.phone_office.url).toMatch(/^tel:/);
  });

  it('every link reference points at something that exists', () => {
    const links = collectLinks(content);
    expect(links.length).toBeGreaterThan(20);
    const anchors = new Set(SECTION_ANCHORS.map((a) => a.value));
    const edmIds = new Set(content.edm.items.map((e) => e.id));
    for (const link of links) {
      switch (link.kind) {
        case 'shared':
          expect(content.site.links, `shared link at ${link.path}`).toHaveProperty(link.value);
          break;
        case 'anchor':
          expect(anchors.has(link.value), `anchor ${link.value} at ${link.path}`).toBe(true);
          break;
        case 'edm':
          expect(edmIds.has(link.value), `edm ${link.value} at ${link.path}`).toBe(true);
          break;
        case 'url':
          expect(link.value, `url at ${link.path}`).toMatch(/^(https?:|tel:|mailto:)/);
          break;
        default:
          throw new Error(`unknown link kind ${link.kind} at ${link.path}`);
      }
    }
  });

  it('nav items cover every page section in order', () => {
    expect(content.site.nav.map((n) => n.target)).toEqual(['about', 'accommodation', 'seasons', 'audiences', 'activities', 'transport', 'faq']);
  });

  it('room ids and faq ids are unique', () => {
    const roomIds = content.rooms.cards.map((r) => r.id);
    expect(new Set(roomIds).size).toBe(roomIds.length);
    const catIds = content.faq.categories.map((c) => c.id);
    expect(new Set(catIds).size).toBe(catIds.length);
  });
});
