import type { SeasonsContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, TextArea, TextInput } from '../form/fields';
import { GalleryField, ImageRefField } from '../form/ImageField';
import { ListEditor } from '../form/ListEditor';

interface Props {
  value: SeasonsContent;
  onChange: (value: SeasonsContent) => void;
}

export function SeasonsEditor({ value, onChange }: Props) {
  const labels = value.labels;
  const setLabel = (key: keyof SeasonsContent['labels'], v: string) => onChange({ ...value, labels: { ...labels, [key]: v } });

  return (
    <div className="space-y-6">
      <Card title="區塊標題與共用文字">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
        <TextArea label="說明文字" value={value.intro} onChange={(v) => onChange({ ...value, intro: v })} />
        <Grid cols={3}>
          <TextInput label="彈窗寫真標題" value={labels.modalGalleryTitle} onChange={(v) => setLabel('modalGalleryTitle', v)} />
          <TextInput label="彈窗關閉文字" value={labels.modalClose} onChange={(v) => setLabel('modalClose', v)} />
          <TextInput label="無說明照片的前綴" value={labels.photoPrefix} onChange={(v) => setLabel('photoPrefix', v)} hint="例：寫真 # 會顯示成 寫真 #1" />
        </Grid>
      </Card>

      <Card title="季節卡片">
        <ListEditor
          items={value.cards}
          onChange={(cards) => onChange({ ...value, cards })}
          itemTitle={(s) => `${s.icon} ${s.period}｜${s.title}`}
          createItem={() => ({
            id: newId('season'),
            icon: '🌸',
            period: '',
            title: '新季節',
            desc: '',
            buttonLabel: '🌸 新季節',
            image: { src: '', alt: '' },
            gallery: [],
          })}
          addLabel="新增季節"
          renderItem={(s, update) => (
            <>
              <Grid cols={3}>
                <TextInput label="圖示（emoji）" value={s.icon} onChange={(v) => update({ ...s, icon: v })} />
                <TextInput label="期間" value={s.period} onChange={(v) => update({ ...s, period: v })} />
                <TextInput label="標題" value={s.title} onChange={(v) => update({ ...s, title: v })} />
              </Grid>
              <TextArea label="描述" value={s.desc} onChange={(v) => update({ ...s, desc: v })} />
              <TextInput label="卡片按鈕文字" value={s.buttonLabel} onChange={(v) => update({ ...s, buttonLabel: v })} />
              <ImageRefField label="卡片封面圖" value={s.image} onChange={(image) => update({ ...s, image })} />
              <GalleryField label="季節寫真（彈窗相簿）" items={s.gallery} onChange={(gallery) => update({ ...s, gallery })} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
