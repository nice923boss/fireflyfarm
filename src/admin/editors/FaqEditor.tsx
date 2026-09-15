import type { FaqContent } from '../../content/schema';
import { Card, Grid, TextArea, TextInput } from '../form/fields';
import { ListEditor } from '../form/ListEditor';
import { AddBlockBar, BLOCK_TYPE_LABELS, BlockEditor, blockSummary } from './BlockEditor';

interface Props {
  value: FaqContent;
  onChange: (value: FaqContent) => void;
}

function nextCategoryId(existing: string[]): string {
  const max = existing.reduce((m, id) => Math.max(m, parseInt(id, 10) || 0), 0);
  return String(max + 1).padStart(2, '0');
}

export function FaqEditor({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <Card title="區塊標題">
        <Grid>
          <TextInput label="英文小標" value={value.kicker} onChange={(v) => onChange({ ...value, kicker: v })} />
          <TextInput label="主標題" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
        </Grid>
        <TextInput label="導言標題" value={value.introTitle} onChange={(v) => onChange({ ...value, introTitle: v })} />
        <TextArea label="導言" value={value.intro} onChange={(v) => onChange({ ...value, intro: v })} />
        <TextInput
          label="分類小標後綴"
          value={value.labels.categorySuffix}
          onChange={(v) => onChange({ ...value, labels: { ...value.labels, categorySuffix: v } })}
          hint="顯示為「01 分類內容」的後半段。"
        />
      </Card>

      <Card title="FAQ 分類與問答">
        <ListEditor
          items={value.categories}
          onChange={(categories) => onChange({ ...value, categories })}
          itemTitle={(cat) => `${cat.icon} ${cat.id}｜${cat.title}（${cat.faqs.length} 題）`}
          createItem={() => ({
            id: nextCategoryId(value.categories.map((c) => c.id)),
            icon: '❓',
            title: '新分類',
            subtitle: '',
            faqs: [],
          })}
          addLabel="新增分類"
          deleteConfirm="確定要刪除整個分類與其所有問答？"
          renderItem={(cat, updateCat) => (
            <>
              <Grid cols={3}>
                <TextInput label="編號" value={cat.id} onChange={(v) => updateCat({ ...cat, id: v })} />
                <TextInput label="圖示（emoji）" value={cat.icon} onChange={(v) => updateCat({ ...cat, icon: v })} />
                <TextInput label="分類名稱" value={cat.title} onChange={(v) => updateCat({ ...cat, title: v })} />
              </Grid>
              <TextInput label="分類副標" value={cat.subtitle} onChange={(v) => updateCat({ ...cat, subtitle: v })} />

              <div className="pt-2">
                <span className="block text-xs font-semibold text-forest-700 mb-2">問答列表</span>
                <ListEditor
                  items={cat.faqs}
                  onChange={(faqs) => updateCat({ ...cat, faqs })}
                  itemTitle={(faq) => faq.q}
                  createItem={() => ({ q: `Q${cat.faqs.length + 1}. 新問題`, blocks: [{ type: 'p' as const, text: '' }] })}
                  addLabel="新增問答"
                  deleteConfirm="確定要刪除這一題？"
                  renderItem={(faq, updateFaq) => (
                    <>
                      <TextInput label="問題" value={faq.q} onChange={(q) => updateFaq({ ...faq, q })} />
                      <span className="block text-xs font-semibold text-forest-700">答案內容區塊</span>
                      <ListEditor
                        items={faq.blocks}
                        onChange={(blocks) => updateFaq({ ...faq, blocks })}
                        itemTitle={(b) => `[${BLOCK_TYPE_LABELS[b.type]}] ${blockSummary(b)}`}
                        createItem={() => ({ type: 'p' as const, text: '' })}
                        addLabel="新增段落文字"
                        deleteConfirm="確定要刪除這個內容區塊？"
                        renderItem={(block, updateBlock) => <BlockEditor block={block} onChange={updateBlock} />}
                      />
                      <AddBlockBar onAdd={(block) => updateFaq({ ...faq, blocks: [...faq.blocks, block] })} />
                    </>
                  )}
                />
              </div>
            </>
          )}
        />
      </Card>
    </div>
  );
}
