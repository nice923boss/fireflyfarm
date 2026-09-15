import type { LinkRef } from '../../content/schema';
import { useAdminContent } from '../AdminContent';
import { Field, INPUT_CLASS, Select, TextInput } from './fields';

/** Section ids rendered by the front-end, selectable as anchor targets. */
export const SECTION_ANCHORS: Array<{ value: string; label: string }> = [
  { value: 'about', label: '關於飛螢（首頁頂部）' },
  { value: 'audiences', label: '專屬體驗' },
  { value: 'accommodation', label: '住宿空間' },
  { value: 'seasons', label: '四季旅行' },
  { value: 'activities', label: '美味與活動' },
  { value: 'transport', label: '交通資訊' },
  { value: 'faq', label: '常見問題' },
];

const KIND_OPTIONS = [
  { value: 'shared', label: '共用連結（LINE、臉書、地圖、電話）' },
  { value: 'anchor', label: '跳到頁面區塊' },
  { value: 'edm', label: '開啟 EDM 專案視窗' },
  { value: 'url', label: '自訂網址' },
];

interface Props {
  label: string;
  value: LinkRef;
  onChange: (value: LinkRef) => void;
  /** Hide the label input when the caller edits the text elsewhere. */
  withLabel?: boolean;
}

export function LinkRefField({ label, value, onChange, withLabel = true }: Props) {
  const { content } = useAdminContent();
  const sharedOptions = Object.entries(content.site.links).map(([key, link]) => ({
    value: key,
    label: `${link.label}（${key}）`,
  }));
  const edmOptions = content.edm.items.map((item) => ({ value: item.id, label: item.title }));

  const setKind = (kind: LinkRef['kind']) => {
    const first =
      kind === 'shared' ? sharedOptions[0]?.value : kind === 'anchor' ? SECTION_ANCHORS[0].value : kind === 'edm' ? edmOptions[0]?.value : '';
    onChange({ ...value, kind, value: first ?? '' });
  };

  return (
    <div className="rounded-xl border border-wood/50 bg-cream-50 p-3 space-y-3">
      <span className="block text-xs font-semibold text-forest-700">{label}</span>
      {withLabel && <TextInput label="按鈕文字" value={value.label} onChange={(v) => onChange({ ...value, label: v })} />}
      <div className="grid sm:grid-cols-2 gap-3">
        <Select label="連結類型" value={value.kind} options={KIND_OPTIONS} onChange={(v) => setKind(v as LinkRef['kind'])} />
        {value.kind === 'shared' && (
          <Select label="共用連結" value={value.value} options={sharedOptions} onChange={(v) => onChange({ ...value, value: v })} />
        )}
        {value.kind === 'anchor' && (
          <Select label="目標區塊" value={value.value} options={SECTION_ANCHORS} onChange={(v) => onChange({ ...value, value: v })} />
        )}
        {value.kind === 'edm' && (
          <Select label="EDM 專案" value={value.value} options={edmOptions} onChange={(v) => onChange({ ...value, value: v })} />
        )}
        {value.kind === 'url' && (
          <Field label="網址" hint="以 https:// 或 tel: 開頭">
            <input
              type="text"
              className={`${INPUT_CLASS} font-mono`}
              value={value.value}
              onChange={(e) => onChange({ ...value, value: e.target.value })}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
