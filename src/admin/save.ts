/**
 * Pure planning of what a "save" commits: changed JSON sections, newly staged images,
 * and orphaned repo images. Kept free of React and fetch so it can be unit-tested.
 */
import { SECTION_FILES, SECTION_KEYS, type Content, type SectionKey } from '../content/schema';
import { collectImageSrcs, mapImageSrcs } from '../lib/content-images';
import type { CommitFile } from '../lib/github';
import { blobToBase64 } from '../lib/image';
import { isRepoImage } from '../lib/image-url';
import type { StagedImage } from './AdminContent';

export interface SavePlan {
  /** Content with blob: URLs replaced by their final repo paths. */
  content: Content;
  sections: SectionKey[];
  files: CommitFile[];
  deletes: string[];
  message: string;
}

/** Files under public/images that must never be removed by orphan cleanup. */
const PROTECTED_IMAGES = new Set(['placeholder.svg']);

export function stableJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}

export function changedSections(base: Content, next: Content): SectionKey[] {
  return SECTION_KEYS.filter((key) => JSON.stringify(base[key]) !== JSON.stringify(next[key]));
}

/**
 * @param existingImages file names currently inside public/images on the branch
 * @returns null when there is nothing to commit
 */
export async function buildSavePlan(
  base: Content,
  draft: Content,
  staged: Map<string, StagedImage>,
  existingImages: string[],
): Promise<SavePlan | null> {
  const content = mapImageSrcs(draft, (src) => {
    if (!src.startsWith('blob:')) return src;
    return staged.get(src)?.repoPath ?? '';
  });

  const sections = changedSections(base, content);
  const files: CommitFile[] = sections.map((key) => ({
    path: SECTION_FILES[key],
    content: stableJson(content[key]),
    encoding: 'utf-8',
  }));

  const referenced = new Set(collectImageSrcs(content));
  for (const [, image] of staged) {
    if (!referenced.has(image.repoPath)) continue;
    files.push({ path: `public/${image.repoPath}`, content: await blobToBase64(image.blob), encoding: 'base64' });
  }

  const existing = new Set(existingImages);
  const deletes = Array.from(new Set(collectImageSrcs(base)))
    .filter((src) => isRepoImage(src) && !referenced.has(src))
    .filter((src) => {
      const name = src.slice('images/'.length);
      return existing.has(name) && !PROTECTED_IMAGES.has(name);
    })
    .map((src) => `public/${src}`);

  if (files.length === 0 && deletes.length === 0) return null;

  const message = `content: update ${sections.length ? sections.join(', ') : 'images'}`;
  return { content, sections, files, deletes, message };
}
