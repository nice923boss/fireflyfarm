import { useRef, useState } from 'react';
import type { GalleryImage, ImageRef } from '../../content/schema';
import { imageUrl } from '../../lib/image-url';
import { useAdminContent } from '../AdminContent';
import { BTN, INPUT_CLASS, TextInput } from './fields';
import { ListEditor } from './ListEditor';

interface PickerProps {
  src: string;
  onPicked: (src: string) => void;
  onClear: () => void;
  height?: string;
}

/** Thumbnail with upload / replace / remove. Uploads are compressed and staged until the owner saves. */
export function ImagePicker({ src, onPicked, onClear, height = 'h-32' }: PickerProps) {
  const { stageImage } = useAdminContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onPicked(await stageImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const staged = src.startsWith('blob:');
  return (
    <div className="space-y-2">
      <div className={`${height} w-full rounded-lg border border-wood/60 bg-cream-200 overflow-hidden relative`}>
        {src ? (
          <img src={imageUrl(src)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-coffee/60">尚未設定圖片</div>
        )}
        {staged && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded">尚未儲存</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void pick(e.target.files?.[0])}
        />
        <button type="button" className={BTN.secondary} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? '壓縮中…' : src ? '更換圖片' : '上傳圖片'}
        </button>
        {src && (
          <button type="button" className={BTN.danger} onClick={onClear}>
            移除
          </button>
        )}
        <span className="text-[11px] text-coffee/60">上傳前自動縮至長邊 1600px、JPEG 品質 0.8</span>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function ImageRefField({ label, value, onChange }: { label: string; value: ImageRef; onChange: (v: ImageRef) => void }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-forest-700">{label}</span>
      <ImagePicker src={value.src} onPicked={(src) => onChange({ ...value, src })} onClear={() => onChange({ ...value, src: '' })} />
      <label className="block">
        <span className="block text-[11px] text-coffee/70 mb-1">圖片替代文字（alt）</span>
        <input type="text" className={INPUT_CLASS} value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
      </label>
      <label className="block">
        <span className="block text-[11px] text-coffee/70 mb-1">或直接填外部圖片網址</span>
        <input
          type="text"
          className={`${INPUT_CLASS} font-mono text-xs`}
          value={value.src.startsWith('blob:') ? '' : value.src}
          placeholder="https://…"
          onChange={(e) => onChange({ ...value, src: e.target.value })}
        />
      </label>
    </div>
  );
}

export function GalleryField({ label, items, onChange }: { label: string; items: GalleryImage[]; onChange: (v: GalleryImage[]) => void }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-forest-700">{label}</span>
      <ListEditor
        items={items}
        onChange={onChange}
        itemTitle={(item) => item.caption || item.src.split('/').pop() || ''}
        createItem={() => ({ src: '', caption: '' })}
        addLabel="新增照片"
        deleteConfirm="確定要刪除這張照片嗎？"
        renderItem={(item, update) => (
          <>
            <ImagePicker src={item.src} onPicked={(src) => update({ ...item, src })} onClear={() => update({ ...item, src: '' })} />
            <TextInput label="照片說明" value={item.caption} onChange={(caption) => update({ ...item, caption })} />
          </>
        )}
      />
    </div>
  );
}
