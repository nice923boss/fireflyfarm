import type { AudiencesContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, TextInput } from '../form/fields';
import { LinkRefField } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';
import { StringList } from '../form/StringList';

interface Props {
  value: AudiencesContent;
  onChange: (value: AudiencesContent) => void;
}

export function AudiencesEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card title="區塊標題">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
      </Card>
      <Card title="體驗卡片">
        <ListEditor
          items={value.cards}
          onChange={(cards) => onChange({ ...value, cards })}
          itemTitle={(card) => `${card.icon} ${card.title}`}
          createItem={() => ({
            id: newId('audience'),
            icon: '✨',
            title: '新體驗',
            items: [],
            button: { label: '👉 了解更多', kind: 'shared' as const, value: 'line' },
          })}
          addLabel="新增體驗卡片"
          renderItem={(card, update) => (
            <>
              <Grid>
                <TextInput label="圖示（emoji）" value={card.icon} onChange={(v) => update({ ...card, icon: v })} />
                <TextInput label="標題" value={card.title} onChange={(v) => update({ ...card, title: v })} />
              </Grid>
              <StringList label="條列項目" items={card.items} onChange={(items) => update({ ...card, items })} />
              <LinkRefField label="卡片按鈕" value={card.button} onChange={(button) => update({ ...card, button })} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
