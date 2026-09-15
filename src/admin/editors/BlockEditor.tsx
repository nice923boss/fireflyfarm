import type { Block, BlockType } from '../../content/schema';
import { BOX_TONES, P_TONES } from '../../content/schema';
import { BTN, Grid, Select, TextArea, TextInput, Toggle } from '../form/fields';
import { LinkRefField } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';
import { StringList } from '../form/StringList';

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  p: '段落文字',
  box: '色塊（標題＋內容）',
  stats: '數字統計格',
  items: '圖示清單',
  contact: '聯絡資訊框',
  buttons: '按鈕列',
};

const P_TONE_LABELS: Record<(typeof P_TONES)[number], string> = {
  normal: '一般',
  muted: '灰色小字',
  note: '焦糖色斜體備註',
  accent: '深綠強調',
  small: '小字',
};

const BOX_TONE_LABELS: Record<(typeof BOX_TONES)[number], string> = {
  cream: '米色',
  amber: '琥珀（提醒）',
  red: '紅色（禁止）',
  emerald: '翠綠（可以）',
  sky: '天藍（資訊）',
};

export function createBlock(type: BlockType): Block {
  switch (type) {
    case 'p':
      return { type: 'p' as const, text: '' };
    case 'box':
      return { type: 'box', tone: 'cream' as const, title: '', lines: [''] };
    case 'stats':
      return { type: 'stats', items: [{ label: '', value: '' }] };
    case 'items':
      return { type: 'items', items: [{ icon: '✅', text: '' }] };
    case 'contact':
      return { type: 'contact', rows: [{ label: '電話', text: '', kind: 'shared' as const, value: 'phone_mobile' }] };
    case 'buttons':
      return { type: 'buttons', buttons: [{ label: '', kind: 'shared' as const, value: 'line', style: 'forest' as const }] };
  }
}

export function blockSummary(block: Block): string {
  switch (block.type) {
    case 'p':
      return block.text.slice(0, 40);
    case 'box':
      return block.title || block.lines[0] || '';
    case 'stats':
      return block.items.map((i) => i.label).join('、');
    case 'items':
      return block.items.map((i) => i.text).join('、').slice(0, 40);
    case 'contact':
      return block.rows.map((r) => r.label).join('、');
    case 'buttons':
      return block.buttons.map((b) => b.label).join('、');
  }
}

export function BlockEditor({ block, onChange }: { block: Block; onChange: (block: Block) => void }) {
  switch (block.type) {
    case 'p':
      return (
        <>
          <TextArea label="文字" hint="用 **文字** 包起來可加粗。" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <Select
            label="樣式"
            value={block.tone ?? 'normal'}
            options={P_TONES.map((t) => ({ value: t, label: P_TONE_LABELS[t] }))}
            onChange={(v) => onChange({ ...block, tone: v === 'normal' ? undefined : (v as typeof block.tone) })}
          />
        </>
      );

    case 'box':
      return (
        <>
          <Grid cols={3}>
            <Select
              label="色塊顏色"
              value={block.tone}
              options={BOX_TONES.map((t) => ({ value: t, label: BOX_TONE_LABELS[t] }))}
              onChange={(v) => onChange({ ...block, tone: v as typeof block.tone })}
            />
            <TextInput label="標題（可留空）" value={block.title ?? ''} onChange={(v) => onChange({ ...block, title: v || undefined })} />
            <TextInput label="標題旁小徽章（可留空）" value={block.badge ?? ''} onChange={(v) => onChange({ ...block, badge: v || undefined })} />
          </Grid>
          <div className="flex flex-wrap gap-4">
            <Toggle label="徽章用深綠色" checked={block.badgeTone === 'forest'} onChange={(on) => onChange({ ...block, badgeTone: on ? 'forest' : undefined })} />
            <Toggle label="內容顯示為點列" checked={block.list ?? false} onChange={(on) => onChange({ ...block, list: on || undefined })} />
          </div>
          <StringList
            label="內容行"
            hint="以「## 」開頭的行會顯示為焦糖色小標題；**文字** 可加粗。"
            items={block.lines}
            onChange={(lines) => onChange({ ...block, lines })}
            multiline
          />
          <TextInput label="底部斜體備註（可留空）" value={block.note ?? ''} onChange={(v) => onChange({ ...block, note: v || undefined })} />
          <Toggle
            label="加一顆小按鈕（例如電話）"
            checked={!!block.button}
            onChange={(on) => onChange({ ...block, button: on ? { label: '0975-783371', kind: 'shared' as const, value: 'phone_mobile' } : undefined })}
          />
          {block.button && <LinkRefField label="色塊按鈕" value={block.button} onChange={(button) => onChange({ ...block, button })} />}
        </>
      );

    case 'stats':
      return (
        <ListEditor
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          itemTitle={(i) => `${i.label}：${i.value}`}
          createItem={() => ({ label: '', value: '' })}
          addLabel="新增統計格"
          collapsed={false}
          renderItem={(item, update) => (
            <Grid>
              <TextInput label="標籤" value={item.label} onChange={(label) => update({ ...item, label })} />
              <TextInput label="數值" value={item.value} onChange={(value) => update({ ...item, value })} />
            </Grid>
          )}
        />
      );

    case 'items':
      return (
        <ListEditor
          items={block.items}
          onChange={(items) => onChange({ ...block, items })}
          itemTitle={(i) => `${i.icon} ${i.text}`}
          createItem={() => ({ icon: '✅', text: '' })}
          addLabel="新增項目"
          collapsed={false}
          renderItem={(item, update) => (
            <Grid>
              <TextInput label="圖示（emoji）" value={item.icon} onChange={(icon) => update({ ...item, icon })} />
              <TextInput label="文字" value={item.text} onChange={(text) => update({ ...item, text })} />
            </Grid>
          )}
        />
      );

    case 'contact':
      return (
        <>
          <ListEditor
            items={block.rows}
            onChange={(rows) => onChange({ ...block, rows })}
            itemTitle={(r) => `${r.label} ${r.text}`}
            createItem={() => ({ label: '', text: '', kind: 'shared' as const, value: 'line' })}
            addLabel="新增聯絡列"
            collapsed={false}
            renderItem={(row, update) => (
              <>
                <Grid>
                  <TextInput label="左側標籤" value={row.label} onChange={(label) => update({ ...row, label })} />
                  <TextInput label="顯示文字" value={row.text} onChange={(text) => update({ ...row, text })} />
                </Grid>
                <LinkRefField label="點擊連到" value={{ label: row.text, kind: row.kind, value: row.value }} withLabel={false} onChange={(l) => update({ ...row, kind: l.kind, value: l.value })} />
              </>
            )}
          />
          <TextInput label="底部備註（可留空）" value={block.note ?? ''} onChange={(v) => onChange({ ...block, note: v || undefined })} />
        </>
      );

    case 'buttons':
      return (
        <ListEditor
          items={block.buttons}
          onChange={(buttons) => onChange({ ...block, buttons })}
          itemTitle={(b) => b.label}
          createItem={() => ({ label: '', kind: 'shared' as const, value: 'line', style: 'forest' as const })}
          addLabel="新增按鈕"
          collapsed={false}
          renderItem={(button, update) => (
            <>
              <LinkRefField label="按鈕" value={button} onChange={(l) => update({ ...button, ...l })} />
              <Select
                label="顏色"
                value={button.style ?? 'forest'}
                options={[
                  { value: 'forest', label: '深綠' },
                  { value: 'emerald', label: '翠綠（LINE）' },
                ]}
                onChange={(v) => update({ ...button, style: v as 'forest' | 'emerald' })}
              />
            </>
          )}
        />
      );
  }
}

/** Toolbar to append a block of a chosen type. */
export function AddBlockBar({ onAdd }: { onAdd: (block: Block) => void }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-coffee/70">新增內容區塊：</span>
      {(Object.keys(BLOCK_TYPE_LABELS) as BlockType[]).map((type) => (
        <button key={type} type="button" className={BTN.secondary} onClick={() => onAdd(createBlock(type))}>
          ＋ {BLOCK_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
