import type { SiteContent } from '../../content/schema';
import { BTN, Card, Grid, Select, TextArea, TextInput, Toggle } from '../form/fields';
import { ImageRefField } from '../form/ImageField';
import { LinkRefField, SECTION_ANCHORS } from '../form/LinkRefField';
import { ListEditor } from '../form/ListEditor';

interface Props {
  value: SiteContent;
  onChange: (value: SiteContent) => void;
}

const ICON_OPTIONS = [
  { value: 'facebook', label: 'Facebook 圖示' },
  { value: 'line', label: 'LINE 圖示' },
  { value: 'phone', label: '電話圖示' },
];

export function SiteEditor({ value, onChange }: Props) {
  const set = <K extends keyof SiteContent>(key: K, next: SiteContent[K]) => onChange({ ...value, [key]: next });
  const linkKeys = Object.keys(value.links);

  const renameLink = (oldKey: string, newKey: string) => {
    const key = newKey.trim().replace(/[^a-z0-9_]/gi, '_').toLowerCase();
    if (!key || key === oldKey || value.links[key]) return;
    const links: SiteContent['links'] = {};
    for (const [k, v] of Object.entries(value.links)) links[k === oldKey ? key : k] = v;
    set('links', links);
  };

  const addLink = () => {
    let key = 'link';
    let i = 1;
    while (value.links[`${key}${i}`]) i += 1;
    set('links', { ...value.links, [`${key}${i}`]: { label: '新連結', url: 'https://' } });
  };

  const removeLink = (key: string) => {
    if (!window.confirm(`確定要刪除共用連結「${key}」？所有引用它的按鈕會失效。`)) return;
    const links = { ...value.links };
    delete links[key];
    set('links', links);
  };

  return (
    <div className="space-y-6">
      <Card title="網站基本資料">
        <Grid>
          <TextInput label="網站名稱" value={value.name} onChange={(v) => set('name', v)} />
          <TextInput label="英文副標" value={value.nameEn} onChange={(v) => set('nameEn', v)} />
        </Grid>
        <TextInput label="標語" value={value.tagline} onChange={(v) => set('tagline', v)} />
        <TextInput label="SEO 標題" value={value.seo.title} onChange={(v) => set('seo', { ...value.seo, title: v })} />
        <TextArea
          label="SEO 描述"
          value={value.seo.description}
          onChange={(v) => set('seo', { ...value.seo, description: v })}
          hint="會寫入網頁 meta description，建議 80 至 120 字。"
        />
      </Card>

      <Card
        title="共用連結（LINE、臉書、地圖、電話）"
        actions={
          <button type="button" className={BTN.secondary} onClick={addLink}>
            ＋ 新增共用連結
          </button>
        }
      >
        <p className="text-xs text-coffee/70">全站按鈕都可引用這些連結，改一次全站生效。電話請用 tel: 開頭。</p>
        <div className="space-y-3">
          {linkKeys.map((key) => {
            const link = value.links[key];
            return (
              <div key={key} className="rounded-xl border border-wood/50 bg-cream-50 p-3 grid sm:grid-cols-[120px_1fr_2fr_auto] gap-3 items-end">
                <TextInput label="代號" value={key} mono onChange={(v) => renameLink(key, v)} />
                <TextInput label="顯示名稱" value={link.label} onChange={(v) => set('links', { ...value.links, [key]: { ...link, label: v } })} />
                <TextInput label="網址" value={link.url} mono onChange={(v) => set('links', { ...value.links, [key]: { ...link, url: v } })} />
                <button type="button" className={BTN.danger} onClick={() => removeLink(key)}>
                  刪除
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="頂部導覽列">
        <ListEditor
          items={value.nav}
          onChange={(nav) => set('nav', nav)}
          itemTitle={(item) => item.label}
          createItem={() => ({ label: '新選單', target: 'about' })}
          addLabel="新增導覽項目"
          renderItem={(item, update) => (
            <Grid>
              <TextInput label="顯示文字" value={item.label} onChange={(v) => update({ ...item, label: v })} />
              <Select label="跳到區塊" value={item.target} options={SECTION_ANCHORS} onChange={(v) => update({ ...item, target: v })} />
              <Toggle label="粗體強調" checked={item.highlight ?? false} onChange={(v) => update({ ...item, highlight: v })} />
            </Grid>
          )}
        />
        <Grid cols={3}>
          <LinkRefField label="臉書按鈕" value={value.headerButtons.facebook} onChange={(v) => set('headerButtons', { ...value.headerButtons, facebook: v })} />
          <LinkRefField label="LINE 按鈕" value={value.headerButtons.line} onChange={(v) => set('headerButtons', { ...value.headerButtons, line: v })} />
          <LinkRefField label="主要按鈕（立即預約）" value={value.headerButtons.primary} onChange={(v) => set('headerButtons', { ...value.headerButtons, primary: v })} />
        </Grid>
      </Card>

      <Card title="首頁主視覺">
        <TextInput label="上方小標籤" value={value.hero.badge} onChange={(v) => set('hero', { ...value.hero, badge: v })} />
        <TextArea label="大標題" rows={2} hint="換行處在電腦版會分行顯示。" value={value.hero.title} onChange={(v) => set('hero', { ...value.hero, title: v })} />
        <TextArea label="副標說明" value={value.hero.subtitle} onChange={(v) => set('hero', { ...value.hero, subtitle: v })} />
        <ImageRefField label="背景圖片" value={value.hero.image} onChange={(v) => set('hero', { ...value.hero, image: v })} />
        <ListEditor
          items={value.hero.buttons}
          onChange={(buttons) => set('hero', { ...value.hero, buttons })}
          itemTitle={(b) => b.label}
          createItem={() => ({ label: '新按鈕', kind: 'anchor' as const, value: 'accommodation' })}
          addLabel="新增主視覺按鈕"
          renderItem={(b, update) => <LinkRefField label="按鈕設定（第一顆為深綠主按鈕）" value={b} onChange={update} />}
        />
      </Card>

      <Card title="頁尾">
        <TextArea label="關於文字" value={value.footer.about} onChange={(v) => set('footer', { ...value.footer, about: v })} />
        <Grid>
          <TextInput label="聯絡資訊標題" value={value.footer.contactTitle} onChange={(v) => set('footer', { ...value.footer, contactTitle: v })} />
          <TextInput label="快速連結標題" value={value.footer.quickLinksTitle} onChange={(v) => set('footer', { ...value.footer, quickLinksTitle: v })} />
        </Grid>
        <ListEditor
          items={value.footer.contactLines}
          onChange={(contactLines) => set('footer', { ...value.footer, contactLines })}
          itemTitle={(line) => line.prefix + (line.link?.label ?? '')}
          createItem={() => ({ prefix: '新資訊：' })}
          addLabel="新增聯絡資訊行"
          renderItem={(line, update) => (
            <>
              <TextInput label="前置文字" value={line.prefix} onChange={(v) => update({ ...line, prefix: v })} />
              <Toggle
                label="後面接一個連結"
                checked={!!line.link}
                onChange={(on) => update(on ? { ...line, link: { label: '連結文字', kind: 'shared' as const, value: 'line' } } : { prefix: line.prefix })}
              />
              {line.link && <LinkRefField label="連結" value={line.link} onChange={(link) => update({ ...line, link })} />}
            </>
          )}
        />
        <ListEditor
          items={value.footer.quickLinks}
          onChange={(quickLinks) => set('footer', { ...value.footer, quickLinks })}
          itemTitle={(l) => l.label}
          createItem={() => ({ label: '新連結', kind: 'anchor' as const, value: 'about' })}
          addLabel="新增快速連結"
          renderItem={(l, update) => <LinkRefField label="快速連結" value={l} onChange={update} />}
        />
        <TextInput label="版權文字" value={value.footer.copyright} onChange={(v) => set('footer', { ...value.footer, copyright: v })} />
      </Card>

      <Card title="右下角浮動按鈕">
        <ListEditor
          items={value.floatingBar}
          onChange={(floatingBar) => set('floatingBar', floatingBar)}
          itemTitle={(b) => b.label}
          createItem={() => ({ icon: 'phone' as const, label: '新按鈕', kind: 'shared' as const, value: 'phone_mobile' })}
          addLabel="新增浮動按鈕"
          renderItem={(b, update) => (
            <>
              <Select label="圖示" value={b.icon} options={ICON_OPTIONS} onChange={(v) => update({ ...b, icon: v as typeof b.icon })} />
              <LinkRefField label="按鈕連結（文字為滑鼠提示）" value={b} onChange={(v) => update({ ...b, ...v })} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
