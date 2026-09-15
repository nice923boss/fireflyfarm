import type { TransportContent } from '../../content/schema';
import { newId } from '../ids';
import { Card, Grid, Select, TextArea, TextInput } from '../form/fields';
import { LinkRefField } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';
import { StringList } from '../form/StringList';

interface Props {
  value: TransportContent;
  onChange: (value: TransportContent) => void;
}

const TONE_OPTIONS = [
  { value: 'amber', label: '琥珀色（警示）' },
  { value: 'cream', label: '米色（一般）' },
];

export function TransportEditor({ value, onChange }: Props) {
  const nav = value.navigation;
  return (
    <div className="space-y-6">
      <Card title="區塊標題">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
        <TextArea label="說明文字" value={value.intro} onChange={(v) => onChange({ ...value, intro: v })} />
      </Card>
      <Card title="導航卡片">
        <Grid>
          <TextInput label="小標" value={nav.kicker} onChange={(v) => onChange({ ...value, navigation: { ...nav, kicker: v } })} />
          <TextInput label="標題" value={nav.title} onChange={(v) => onChange({ ...value, navigation: { ...nav, title: v } })} />
        </Grid>
        <TextInput label="說明" value={nav.desc} onChange={(v) => onChange({ ...value, navigation: { ...nav, desc: v } })} />
        <LinkRefField label="導航按鈕" value={nav.button} onChange={(button) => onChange({ ...value, navigation: { ...nav, button } })} />
      </Card>
      <Card title="步驟清單">
        <ListEditor
          items={value.lists}
          onChange={(lists) => onChange({ ...value, lists })}
          itemTitle={(list) => `${list.icon} ${list.title}`}
          createItem={() => ({ id: newId('transport'), tone: 'cream' as const, icon: '📋', title: '新清單', steps: [] })}
          addLabel="新增清單"
          renderItem={(list, update) => (
            <>
              <Grid cols={3}>
                <TextInput label="圖示（emoji）" value={list.icon} onChange={(v) => update({ ...list, icon: v })} />
                <TextInput label="標題" value={list.title} onChange={(v) => update({ ...list, title: v })} />
                <Select label="樣式" value={list.tone} options={TONE_OPTIONS} onChange={(v) => update({ ...list, tone: v as typeof list.tone })} />
              </Grid>
              <StringList label="步驟（依序編號）" items={list.steps} onChange={(steps) => update({ ...list, steps })} multiline addLabel="新增步驟" />
            </>
          )}
        />
      </Card>
    </div>
  );
}
