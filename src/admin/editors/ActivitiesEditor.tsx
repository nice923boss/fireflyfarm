import type { ActivitiesContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, TextArea, TextInput } from '../form/fields';
import { ListEditor } from '../form/ListEditor';
import { StringList } from '../form/StringList';

interface Props {
  value: ActivitiesContent;
  onChange: (value: ActivitiesContent) => void;
}

export function ActivitiesEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card title="區塊標題">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
      </Card>
      <Card title="活動與餐飲卡片">
        <ListEditor
          items={value.cards}
          onChange={(cards) => onChange({ ...value, cards })}
          itemTitle={(card) => `${card.icon} ${card.title}`}
          createItem={() => ({ id: newId('activity'), icon: '🍲', title: '新活動', desc: '', items: [], notes: [] })}
          addLabel="新增卡片"
          renderItem={(card, update) => (
            <>
              <Grid>
                <TextInput label="圖示（emoji）" value={card.icon} onChange={(v) => update({ ...card, icon: v })} />
                <TextInput label="標題" value={card.title} onChange={(v) => update({ ...card, title: v })} />
              </Grid>
              <TextArea label="說明" hint="用 **文字** 包起來可加粗。" value={card.desc} onChange={(v) => update({ ...card, desc: v })} />
              <StringList label="條列項目" items={card.items} onChange={(items) => update({ ...card, items })} />
              <StringList label="注意事項（底部淺色框）" items={card.notes} onChange={(notes) => update({ ...card, notes })} multiline />
            </>
          )}
        />
      </Card>
    </div>
  );
}
