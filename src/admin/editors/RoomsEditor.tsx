import type { RoomsContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, TextArea, TextInput } from '../form/fields';
import { GalleryField, ImageRefField } from '../form/ImageField';
import { LinkRefField } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';
import { StringList } from '../form/StringList';

interface Props {
  value: RoomsContent;
  onChange: (value: RoomsContent) => void;
}

export function RoomsEditor({ value, onChange }: Props) {
  const labels = value.labels;
  const setLabel = (key: keyof RoomsContent['labels'], v: string) => onChange({ ...value, labels: { ...labels, [key]: v } });

  return (
    <div className="space-y-6">
      <Card title="區塊標題與共用文字">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
        <TextArea label="說明文字" value={value.intro} onChange={(v) => onChange({ ...value, intro: v })} />
        <Grid cols={3}>
          <TextInput label="圖片滑過提示" value={labels.hoverBadge} onChange={(v) => setLabel('hoverBadge', v)} />
          <TextInput label="房價區標題" value={labels.priceTitle} onChange={(v) => setLabel('priceTitle', v)} />
          <TextInput label="設備區標題" value={labels.equipmentTitle} onChange={(v) => setLabel('equipmentTitle', v)} />
          <TextInput label="詳細按鈕文字" value={labels.detailButton} onChange={(v) => setLabel('detailButton', v)} />
          <TextInput label="彈窗標題後綴" value={labels.modalTitleSuffix} onChange={(v) => setLabel('modalTitleSuffix', v)} />
          <TextInput label="彈窗寫真標題" value={labels.modalGalleryTitle} onChange={(v) => setLabel('modalGalleryTitle', v)} />
          <TextInput label="彈窗設備標題" value={labels.modalEquipmentTitle} onChange={(v) => setLabel('modalEquipmentTitle', v)} />
          <TextInput label="彈窗關閉文字" value={labels.modalClose} onChange={(v) => setLabel('modalClose', v)} />
        </Grid>
        <LinkRefField label="預約按鈕（所有房型共用）" value={value.bookButton} onChange={(bookButton) => onChange({ ...value, bookButton })} />
      </Card>

      <Card title="房型卡片">
        <ListEditor
          items={value.cards}
          onChange={(cards) => onChange({ ...value, cards })}
          itemTitle={(room) => `${room.category}｜${room.name}`}
          createItem={() => ({
            id: newId('room'),
            category: '新分類',
            name: '新房型',
            desc: '',
            priceNote: '',
            image: { src: '', alt: '' },
            equipment: [],
            gallery: [],
          })}
          addLabel="新增房型"
          deleteConfirm="確定要刪除這個房型？其照片若沒有其他地方使用，儲存後會一併從倉庫移除。"
          renderItem={(room, update) => (
            <>
              <Grid>
                <TextInput label="分類標籤" value={room.category} onChange={(v) => update({ ...room, category: v })} />
                <TextInput label="房型名稱" value={room.name} onChange={(v) => update({ ...room, name: v })} />
              </Grid>
              <TextArea label="房型描述" value={room.desc} onChange={(v) => update({ ...room, desc: v })} />
              <TextInput label="房價說明" value={room.priceNote} onChange={(v) => update({ ...room, priceNote: v })} />
              <ImageRefField label="卡片封面圖" value={room.image} onChange={(image) => update({ ...room, image })} />
              <StringList label="房間與公共設備" items={room.equipment} onChange={(equipment) => update({ ...room, equipment })} addLabel="新增設備" />
              <GalleryField label="詳細寫真（彈窗相簿）" items={room.gallery} onChange={(gallery) => update({ ...room, gallery })} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
