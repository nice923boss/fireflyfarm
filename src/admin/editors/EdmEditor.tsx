import type { EdmContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, TextArea, TextInput } from '../form/fields';
import { ImageRefField } from '../form/ImageField';
import { LinkRefField } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';

interface Props {
  value: EdmContent;
  onChange: (value: EdmContent) => void;
}

export function EdmEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card title="EDM 視窗共用文字">
        <Grid>
          <TextInput label="視窗上方標籤" value={value.badge} onChange={(v) => onChange({ ...value, badge: v })} />
          <TextInput label="關閉按鈕文字" value={value.closeLabel} onChange={(v) => onChange({ ...value, closeLabel: v })} />
        </Grid>
      </Card>
      <Card title="EDM 專案">
        <p className="text-xs text-coffee/70">體驗卡片或 FAQ 按鈕可選「開啟 EDM 專案視窗」來連到這裡的項目。刪除項目前請先確認沒有按鈕引用。</p>
        <ListEditor
          items={value.items}
          onChange={(items) => onChange({ ...value, items })}
          itemTitle={(item) => item.title}
          createItem={() => ({
            id: newId('edm'),
            title: '新專案',
            heading: '',
            body: '',
            priceTitle: '💰 報價參考：',
            priceText: '',
            image: { src: '', alt: '' },
            imagePlaceholder: '（ 專案 EDM 圖片與精美排版・待補 ）',
            button: { label: '洽詢專案與索取完整EDM', kind: 'shared' as const, value: 'line' },
          })}
          addLabel="新增 EDM 專案"
          renderItem={(item, update) => (
            <>
              <TextInput label="專案標題（視窗標題）" value={item.title} onChange={(v) => update({ ...item, title: v })} />
              <TextInput label="內文標題" value={item.heading} onChange={(v) => update({ ...item, heading: v })} />
              <TextArea label="內文" rows={4} value={item.body} onChange={(v) => update({ ...item, body: v })} />
              <Grid>
                <TextInput label="報價標題" value={item.priceTitle} onChange={(v) => update({ ...item, priceTitle: v })} />
                <TextInput label="報價說明" value={item.priceText} onChange={(v) => update({ ...item, priceText: v })} />
              </Grid>
              <ImageRefField label="EDM 圖片" value={item.image} onChange={(image) => update({ ...item, image })} />
              <TextInput label="沒有圖片時顯示的文字" value={item.imagePlaceholder} onChange={(v) => update({ ...item, imagePlaceholder: v })} />
              <LinkRefField label="洽詢按鈕" value={item.button} onChange={(button) => update({ ...item, button })} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
