import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadBundledContent } from '../content';
import { ContentSchema, SECTION_FILES, SECTION_KEYS, type Content, type SectionKey } from '../content/schema';
import { mapImageSrcs } from '../lib/content-images';
import { commitFiles, listDirectory, readTextFile, type RepoConfig } from '../lib/github';
import { compressImage, imageFileName } from '../lib/image';
import { clearDraft, clearToken, loadDraft, loadRepoConfig, loadToken, saveDraft, saveRepoConfig, saveToken } from '../lib/storage';
import { AdminContentProvider, type StagedImage } from './AdminContent';
import { DeployStatus } from './DeployStatus';
import { Login } from './Login';
import { Preview } from './Preview';
import { buildSavePlan, changedSections } from './save';
import { BTN } from './form/fields';
import { SiteEditor } from './editors/SiteEditor';
import { AudiencesEditor } from './editors/AudiencesEditor';
import { RoomsEditor } from './editors/RoomsEditor';
import { SeasonsEditor } from './editors/SeasonsEditor';
import { ActivitiesEditor } from './editors/ActivitiesEditor';
import { TransportEditor } from './editors/TransportEditor';
import { FaqEditor } from './editors/FaqEditor';
import { EdmEditor } from './editors/EdmEditor';

const SECTION_LABELS: Record<SectionKey, string> = {
  site: '網站設定',
  audiences: '專屬體驗',
  rooms: '住宿空間',
  seasons: '四季旅行',
  activities: '美味與活動',
  transport: '交通資訊',
  faq: '常見問題',
  edm: 'EDM 專案',
};

type Phase = { kind: 'login' } | { kind: 'loading' } | { kind: 'error'; message: string } | { kind: 'ready' };

interface SaveState {
  busy: boolean;
  message: string;
  tone: 'ok' | 'fail' | 'info';
}

/** Loads every section JSON from the repo; falls back to the bundled copy when a file is missing. */
async function loadRepoContent(repo: RepoConfig, token: string): Promise<{ content: Content; notices: string[] }> {
  const bundled = loadBundledContent();
  const notices: string[] = [];
  const raw: Record<string, unknown> = {};
  for (const key of SECTION_KEYS) {
    const text = await readTextFile(repo, token, SECTION_FILES[key]);
    if (text === null) {
      notices.push(`倉庫沒有 ${SECTION_FILES[key]}，改用內建內容。`);
      raw[key] = bundled[key];
    } else {
      raw[key] = JSON.parse(text);
    }
  }
  const parsed = ContentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`倉庫內容格式錯誤：${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('；')}`);
  }
  return { content: parsed.data, notices };
}

export function AdminApp() {
  const [repo, setRepo] = useState<RepoConfig>(() => loadRepoConfig());
  const [token, setToken] = useState<string | null>(() => loadToken());
  const [phase, setPhase] = useState<Phase>(() => (loadToken() ? { kind: 'loading' } : { kind: 'login' }));
  const [base, setBase] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [section, setSection] = useState<SectionKey>('site');
  const [preview, setPreview] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [save, setSave] = useState<SaveState>({ busy: false, message: '', tone: 'info' });
  const [lastSha, setLastSha] = useState<string | null>(null);
  const [deployKey, setDeployKey] = useState(0);
  const staged = useRef(new Map<string, StagedImage>());

  const dirtySections = useMemo(() => (base && draft ? changedSections(base, draft) : []), [base, draft]);
  const dirty = dirtySections.length > 0;

  /* ---------- load from repo after login ---------- */
  useEffect(() => {
    if (phase.kind !== 'loading' || !token) return;
    let cancelled = false;
    loadRepoContent(repo, token)
      .then(({ content, notices: loadNotices }) => {
        if (cancelled) return;
        setBase(content);
        const restored = restoreDraft(content);
        setDraft(restored.content);
        setNotices([...loadNotices, ...restored.notices]);
        setPhase({ kind: 'ready' });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPhase({ kind: 'error', message: err instanceof Error ? err.message : '載入失敗' });
      });
    return () => {
      cancelled = true;
    };
  }, [phase.kind, repo, token]);

  /* ---------- draft autosave + unload guard ---------- */
  useEffect(() => {
    if (!draft || !dirty) return;
    const timer = window.setTimeout(() => saveDraft(mapImageSrcs(draft, (src) => (src.startsWith('blob:') ? '' : src))), 500);
    return () => window.clearTimeout(timer);
  }, [draft, dirty]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  /* ---------- image staging ---------- */
  const stageImage = useCallback(async (file: File) => {
    const { blob } = await compressImage(file);
    const url = URL.createObjectURL(blob);
    staged.current.set(url, { repoPath: `images/${imageFileName(file.name)}`, blob });
    return url;
  }, []);

  const releaseStaged = () => {
    for (const url of staged.current.keys()) URL.revokeObjectURL(url);
    staged.current.clear();
  };

  /* ---------- actions ---------- */
  const login = (newToken: string, newRepo: RepoConfig) => {
    saveToken(newToken);
    saveRepoConfig(newRepo);
    setToken(newToken);
    setRepo(newRepo);
    setPhase({ kind: 'loading' });
  };

  const logout = () => {
    if (dirty && !window.confirm('尚有未儲存的變更，登出後草稿會保留在此瀏覽器。確定登出？')) return;
    clearToken();
    releaseStaged();
    setToken(null);
    setBase(null);
    setDraft(null);
    setPhase({ kind: 'login' });
  };

  const discard = () => {
    if (!base || !window.confirm('確定要捨棄所有未儲存的變更？')) return;
    releaseStaged();
    clearDraft();
    setDraft(base);
    setSave({ busy: false, message: '已捨棄變更。', tone: 'info' });
  };

  const publish = async () => {
    if (!base || !draft || !token) return;
    setSave({ busy: true, message: '正在檢查變更…', tone: 'info' });
    try {
      const existing = await listDirectory(repo, token, 'public/images');
      const plan = await buildSavePlan(base, draft, staged.current, existing);
      if (!plan) {
        setSave({ busy: false, message: '沒有需要儲存的變更。', tone: 'info' });
        return;
      }
      setSave({ busy: true, message: `正在送出 ${plan.files.length} 個檔案到 GitHub…`, tone: 'info' });
      const sha = await commitFiles(repo, token, plan);
      releaseStaged();
      clearDraft();
      setBase(plan.content);
      setDraft(plan.content);
      setLastSha(sha);
      setDeployKey((k) => k + 1);
      setSave({
        busy: false,
        message: `已送出，約 1 至 2 分鐘後生效。（commit ${sha.slice(0, 7)}，更新：${plan.sections.map((s) => SECTION_LABELS[s]).join('、') || '圖片'}）`,
        tone: 'ok',
      });
    } catch (err) {
      setSave({ busy: false, message: `儲存失敗：${err instanceof Error ? err.message : '未知錯誤'}`, tone: 'fail' });
    }
  };

  /* ---------- render ---------- */
  if (phase.kind === 'login' || !token) return <Login repo={repo} onLogin={login} />;

  if (phase.kind === 'loading') {
    return <Centered>正在從 GitHub 讀取內容…</Centered>;
  }

  if (phase.kind === 'error' || !base || !draft) {
    return (
      <Centered>
        <p className="text-red-700">{phase.kind === 'error' ? phase.message : '載入失敗'}</p>
        <div className="flex gap-2 justify-center mt-4">
          <button type="button" className={BTN.secondary} onClick={() => setPhase({ kind: 'loading' })}>
            重試
          </button>
          <button type="button" className={BTN.secondary} onClick={logout}>
            登出
          </button>
        </div>
      </Centered>
    );
  }

  const adminValue = { content: draft, stageImage };

  if (preview) {
    return (
      <AdminContentProvider value={adminValue}>
        <Preview content={draft} onClose={() => setPreview(false)} />
      </AdminContentProvider>
    );
  }

  const update = <K extends SectionKey>(key: K, value: Content[K]) => setDraft({ ...draft, [key]: value });

  const editor = (() => {
    switch (section) {
      case 'site':
        return <SiteEditor value={draft.site} onChange={(v) => update('site', v)} />;
      case 'audiences':
        return <AudiencesEditor value={draft.audiences} onChange={(v) => update('audiences', v)} />;
      case 'rooms':
        return <RoomsEditor value={draft.rooms} onChange={(v) => update('rooms', v)} />;
      case 'seasons':
        return <SeasonsEditor value={draft.seasons} onChange={(v) => update('seasons', v)} />;
      case 'activities':
        return <ActivitiesEditor value={draft.activities} onChange={(v) => update('activities', v)} />;
      case 'transport':
        return <TransportEditor value={draft.transport} onChange={(v) => update('transport', v)} />;
      case 'faq':
        return <FaqEditor value={draft.faq} onChange={(v) => update('faq', v)} />;
      case 'edm':
        return <EdmEditor value={draft.edm} onChange={(v) => update('edm', v)} />;
    }
  })();

  const SAVE_TONE = { ok: 'text-emerald-800', fail: 'text-red-700', info: 'text-coffee/80' };

  return (
    <AdminContentProvider value={adminValue}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-wood/60">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
            <div className="mr-auto">
              <p className="text-[10px] tracking-widest text-caramel font-semibold">ADMIN</p>
              <h1 className="font-serif font-bold text-forest-700 leading-tight">{draft.site.name} 網站後台</h1>
            </div>
            <a className={BTN.secondary} href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer">
              開啟正式網站
            </a>
            <button type="button" className={BTN.secondary} onClick={() => setPreview(true)}>
              預覽草稿
            </button>
            <button type="button" className={BTN.secondary} onClick={discard} disabled={!dirty || save.busy}>
              捨棄變更
            </button>
            <button type="button" className={BTN.primary} onClick={() => void publish()} disabled={!dirty || save.busy}>
              {save.busy ? '儲存中…' : dirty ? `儲存並發布（${dirtySections.length} 區）` : '沒有變更'}
            </button>
            <button type="button" className={BTN.secondary} onClick={logout}>
              登出
            </button>
          </div>
          <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-3">
            <DeployStatus repo={repo} expectedSha={lastSha} refreshKey={deployKey} />
            {save.message && <p className={`text-xs font-semibold ${SAVE_TONE[save.tone]}`}>{save.message}</p>}
          </div>
        </header>

        {notices.length > 0 && (
          <div className="max-w-7xl mx-auto w-full px-4 pt-4">
            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 space-y-1">
              {notices.map((n) => (
                <p key={n}>{n}</p>
              ))}
              <button type="button" className="underline" onClick={() => setNotices([])}>
                知道了
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto w-full px-4 py-6 grid gap-6 md:grid-cols-[200px_1fr] flex-1">
          <nav className="md:sticky md:top-32 self-start">
            <ul className="flex md:flex-col flex-wrap gap-1">
              {SECTION_KEYS.map((key) => {
                const active = key === section;
                const changed = dirtySections.includes(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setSection(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        active ? 'bg-forest-700 text-white' : 'text-coffee hover:bg-cream-200'
                      }`}
                    >
                      {SECTION_LABELS[key]}
                      {changed && <span className="ml-1 text-amber-400">●</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
          <section className="min-w-0">
            <h2 className="font-serif text-xl font-bold text-forest-700 mb-4">{SECTION_LABELS[section]}</h2>
            {editor}
          </section>
        </div>

        <footer className="text-center text-[11px] text-coffee/40 py-4">製作者：黃政文</footer>
      </div>
    </AdminContentProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-wood/60 p-6 text-sm text-coffee text-center max-w-md">{children}</div>
    </div>
  );
}

/** Restores a localStorage draft on top of the repo content, dropping staged images that no longer exist. */
function restoreDraft(base: Content): { content: Content; notices: string[] } {
  const record = loadDraft<Content>();
  if (!record) return { content: base, notices: [] };
  const parsed = ContentSchema.safeParse(record.data);
  if (!parsed.success) {
    clearDraft();
    return { content: base, notices: ['發現一份格式已失效的舊草稿，已略過。'] };
  }
  if (changedSections(base, parsed.data).length === 0) {
    clearDraft();
    return { content: base, notices: [] };
  }
  const when = new Date(record.savedAt).toLocaleString('zh-TW', { hour12: false });
  if (!window.confirm(`發現 ${when} 的未儲存草稿，要復原嗎？\n（尚未儲存的上傳圖片無法復原，需重新上傳）`)) {
    clearDraft();
    return { content: base, notices: [] };
  }
  return { content: parsed.data, notices: [`已復原 ${when} 的草稿。`] };
}
