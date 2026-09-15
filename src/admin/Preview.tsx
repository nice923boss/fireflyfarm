import type { Content } from '../content/schema';
import { Site } from '../site/Site';

/** Full-page render of the draft using the real front-end components. */
export function Preview({ content, onClose }: { content: Content; onClose: () => void }) {
  return (
    <div className="relative">
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-forest-900/90 text-white text-xs rounded-full px-4 py-2 shadow-lg">
        <span>預覽模式：這是尚未發布的草稿</span>
        <button type="button" className="underline font-semibold" onClick={onClose}>
          回到後台
        </button>
      </div>
      <Site content={content} />
    </div>
  );
}
