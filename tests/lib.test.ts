import { describe, expect, it } from 'vitest';
import { parseInline, stripInline } from '../src/lib/inline';
import { imageFileName } from '../src/lib/image';
import { imageUrl, isRepoImage } from '../src/lib/image-url';
import { isExternal, resolveHref } from '../src/lib/links';
import { moveItem, removeAt, replaceAt } from '../src/admin/form/ListEditor';
import { describeRun } from '../src/admin/DeployStatus';
import { newId } from '../src/admin/ids';
import { loadBundledContent } from '../src/content';
import { collectImageSrcs, mapImageSrcs } from '../src/lib/content-images';
import type { WorkflowRun } from '../src/lib/github';

describe('parseInline', () => {
  it('splits **bold** runs', () => {
    expect(parseInline('a **b** c')).toEqual([
      { text: 'a ', bold: false },
      { text: 'b', bold: true },
      { text: ' c', bold: false },
    ]);
  });
  it('keeps unbalanced markers literal', () => {
    expect(parseInline('a **b')).toEqual([{ text: 'a **b', bold: false }]);
  });
  it('stripInline removes markers only', () => {
    expect(stripInline('**x** y **z**')).toBe('x y z');
  });
});

describe('imageFileName', () => {
  it('prefixes a timestamp and slugs the name', () => {
    expect(imageFileName('My Photo 測試.PNG', 1700000000000)).toBe('1700000000000-my-photo.jpg');
  });
  it('falls back to photo when nothing survives slugging', () => {
    expect(imageFileName('照片.jpg', 5)).toBe('5-photo.jpg');
  });
  it('caps the slug at 40 chars', () => {
    const name = imageFileName('a'.repeat(80) + '.jpg', 1);
    expect(name).toBe(`1-${'a'.repeat(40)}.jpg`);
  });
});

describe('image urls', () => {
  it('prefixes repo images with the Vite base', () => {
    expect(imageUrl('images/x.jpg')).toBe(`${import.meta.env.BASE_URL}images/x.jpg`);
  });
  it('leaves absolute, data and blob urls untouched', () => {
    for (const src of ['https://a/b.jpg', 'http://a/b.jpg', 'data:image/png;base64,AA', 'blob:http://x/1']) {
      expect(imageUrl(src)).toBe(src);
    }
  });
  it('isRepoImage only matches the images/ prefix', () => {
    expect(isRepoImage('images/a.jpg')).toBe(true);
    expect(isRepoImage('https://x/images/a.jpg')).toBe(false);
    expect(isRepoImage('')).toBe(false);
  });
});

describe('links', () => {
  const site = loadBundledContent().site;
  it('resolves shared keys to the site links', () => {
    expect(resolveHref({ kind: 'shared', value: 'line' }, site)).toEqual({ href: site.links.line.url, external: true });
    expect(resolveHref({ kind: 'shared', value: 'phone_mobile' }, site)?.external).toBe(false);
  });
  it('returns null for unknown shared keys and non-href kinds', () => {
    expect(resolveHref({ kind: 'shared', value: 'nope' }, site)).toBeNull();
    expect(resolveHref({ kind: 'anchor', value: 'faq' }, site)).toBeNull();
    expect(resolveHref({ kind: 'edm', value: 'school' }, site)).toBeNull();
  });
  it('isExternal', () => {
    expect(isExternal('https://x')).toBe(true);
    expect(isExternal('tel:123')).toBe(false);
  });
});

describe('list helpers', () => {
  it('moveItem reorders and ignores out-of-range targets', () => {
    expect(moveItem([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
    expect(moveItem([1, 2, 3], 2, 0)).toEqual([3, 1, 2]);
    const same = [1, 2, 3];
    expect(moveItem(same, 0, -1)).toBe(same);
    expect(moveItem(same, 2, 3)).toBe(same);
  });
  it('replaceAt and removeAt do not mutate', () => {
    const items = ['a', 'b', 'c'];
    expect(replaceAt(items, 1, 'x')).toEqual(['a', 'x', 'c']);
    expect(removeAt(items, 0)).toEqual(['b', 'c']);
    expect(items).toEqual(['a', 'b', 'c']);
  });
});

describe('describeRun', () => {
  const run = (partial: Partial<WorkflowRun>): WorkflowRun => ({
    id: 1,
    status: 'completed',
    conclusion: 'success',
    html_url: 'https://github.com/x/y/actions/runs/1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:01:00Z',
    head_sha: 'abc',
    ...partial,
  });

  it('reports no history when nothing was pushed and no runs exist', () => {
    expect(describeRun(null, null)).toEqual({ text: '尚無部署紀錄', tone: 'idle' });
  });
  it('stays busy after a push until a run for that sha shows up', () => {
    expect(describeRun(null, 'new').tone).toBe('busy');
    expect(describeRun(run({ head_sha: 'old' }), 'new').tone).toBe('busy');
  });
  it('maps run states to tones', () => {
    expect(describeRun(run({ status: 'queued', conclusion: null }), 'abc').text).toBe('部署排隊中…');
    expect(describeRun(run({ status: 'in_progress', conclusion: null }), 'abc').tone).toBe('busy');
    expect(describeRun(run({}), 'abc')).toEqual({ text: '最近一次部署成功', tone: 'ok' });
    expect(describeRun(run({ conclusion: 'failure' }), null)).toEqual({ text: '最近一次部署失敗（failure）', tone: 'fail' });
  });
});

describe('newId', () => {
  it('uses the prefix and base36 time', () => {
    expect(newId('room', 36)).toBe('room-10');
  });
});

describe('content images', () => {
  const content = loadBundledContent();
  it('collects hero, room, season and edm images and skips empty srcs', () => {
    const srcs = collectImageSrcs(content);
    expect(srcs).toContain(content.site.hero.image.src);
    expect(srcs).toContain(content.rooms.cards[0].image.src);
    expect(srcs.every(Boolean)).toBe(true);
    const expectedCount =
      1 +
      content.rooms.cards.reduce((n, r) => n + 1 + r.gallery.length, 0) +
      content.seasons.cards.reduce((n, s) => n + 1 + s.gallery.length, 0) +
      content.edm.items.filter((e) => e.image.src).length;
    expect(srcs).toHaveLength(expectedCount);
  });
  it('mapImageSrcs rewrites every src without touching other fields', () => {
    const mapped = mapImageSrcs(content, (src) => (src ? `X:${src}` : src));
    expect(collectImageSrcs(mapped).every((s) => s.startsWith('X:'))).toBe(true);
    expect(mapped.rooms.cards[0].name).toBe(content.rooms.cards[0].name);
    expect(mapped.faq).toBe(content.faq);
    expect(content.rooms.cards[0].image.src.startsWith('X:')).toBe(false);
  });
});
