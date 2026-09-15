import { describe, expect, it } from 'vitest';
import { loadBundledContent, type Content } from '../src/content';
import { buildSavePlan, changedSections, stableJson } from '../src/admin/save';
import type { StagedImage } from '../src/admin/AdminContent';

const base = loadBundledContent();

function withRoomImage(content: Content, src: string, gallery: string[] = []): Content {
  return {
    ...content,
    rooms: {
      ...content.rooms,
      cards: content.rooms.cards.map((room, i) =>
        i === 0 ? { ...room, image: { ...room.image, src }, gallery: gallery.map((g) => ({ src: g, caption: '' })) } : room,
      ),
    },
  };
}

describe('changedSections', () => {
  it('detects only the sections whose JSON differs', () => {
    expect(changedSections(base, base)).toEqual([]);
    const next = { ...base, site: { ...base.site, name: '新名稱' } };
    expect(changedSections(base, next)).toEqual(['site']);
  });
});

describe('stableJson', () => {
  it('pretty prints with a trailing newline', () => {
    expect(stableJson({ a: 1 })).toBe('{\n  "a": 1\n}\n');
  });
});

describe('buildSavePlan', () => {
  it('returns null when nothing changed', async () => {
    expect(await buildSavePlan(base, base, new Map(), [])).toBeNull();
  });

  it('commits only changed section files', async () => {
    const draft = { ...base, faq: { ...base.faq, heading: '常見問題 v2' } };
    const plan = await buildSavePlan(base, draft, new Map(), []);
    expect(plan?.sections).toEqual(['faq']);
    expect(plan?.files.map((f) => f.path)).toEqual(['content/faq.json']);
    expect(plan?.files[0].encoding).toBe('utf-8');
    expect(JSON.parse(plan!.files[0].content).heading).toBe('常見問題 v2');
    expect(plan?.deletes).toEqual([]);
    expect(plan?.message).toBe('content: update faq');
  });

  it('swaps staged blob urls for repo paths and uploads the image as base64', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/jpeg' });
    const staged = new Map<string, StagedImage>([['blob:http://x/1', { repoPath: 'images/123-photo.jpg', blob }]]);
    const draft = withRoomImage(base, 'blob:http://x/1');
    const plan = await buildSavePlan(base, draft, staged, []);
    expect(plan?.sections).toEqual(['rooms']);
    expect(plan?.content.rooms.cards[0].image.src).toBe('images/123-photo.jpg');
    expect(plan?.files.map((f) => f.path)).toEqual(['content/rooms.json', 'public/images/123-photo.jpg']);
    expect(plan?.files[1]).toMatchObject({ encoding: 'base64', content: 'AQIDBA==' });
    expect(JSON.parse(plan!.files[0].content).cards[0].image.src).toBe('images/123-photo.jpg');
  });

  it('skips staged images that the draft no longer references', async () => {
    const blob = new Blob([new Uint8Array([1])]);
    const staged = new Map<string, StagedImage>([['blob:http://x/orphan', { repoPath: 'images/1-orphan.jpg', blob }]]);
    const draft = { ...base, site: { ...base.site, name: 'x' } };
    const plan = await buildSavePlan(base, draft, staged, []);
    expect(plan?.files.map((f) => f.path)).toEqual(['content/site.json']);
  });

  it('deletes repo images that were replaced, but never the placeholder or files not on the branch', async () => {
    const before = withRoomImage(base, 'images/old.jpg', ['images/placeholder.svg', 'images/gone-already.jpg', 'images/keep.jpg']);
    const after = withRoomImage(base, 'images/new.jpg', ['images/keep.jpg']);
    const plan = await buildSavePlan(before, after, new Map(), ['old.jpg', 'placeholder.svg', 'keep.jpg', 'new.jpg']);
    expect(plan?.deletes).toEqual(['public/images/old.jpg']);
  });

  it('does not treat external urls as deletable repo images', async () => {
    const before = withRoomImage(base, 'https://example.com/a.jpg');
    const after = withRoomImage(base, 'https://example.com/b.jpg');
    const plan = await buildSavePlan(before, after, new Map(), ['a.jpg']);
    expect(plan?.deletes).toEqual([]);
  });

  it('blob urls with no staged entry become empty srcs instead of leaking into JSON', async () => {
    const draft = withRoomImage(base, 'blob:http://x/lost');
    const plan = await buildSavePlan(base, draft, new Map(), []);
    expect(plan?.content.rooms.cards[0].image.src).toBe('');
    expect(plan!.files[0].content.includes('blob:')).toBe(false);
  });
});
