import { useState, type FormEvent } from 'react';
import { verifyToken, type RepoConfig } from '../lib/github';
import { BTN, INPUT_CLASS, Field } from './form/fields';

interface Props {
  repo: RepoConfig;
  onLogin: (token: string, repo: RepoConfig) => void;
}

export function Login({ repo: initialRepo, onLogin }: Props) {
  const [repo, setRepo] = useState(initialRepo);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError('請貼上 Token。');
      return;
    }
    setBusy(true);
    setError('');
    const check = await verifyToken(repo, trimmed);
    setBusy(false);
    if (!check.ok || !check.canPush) {
      setError(check.message);
      return;
    }
    onLogin(trimmed, repo);
  };

  const guideUrl = `https://github.com/${repo.owner}/${repo.repo}/blob/${repo.branch}/docs/老闆後台操作說明.md`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <form onSubmit={(e) => void submit(e)} className="w-full max-w-md bg-white rounded-2xl border border-wood/60 p-6 space-y-5">
        <div>
          <p className="text-xs tracking-widest text-caramel font-semibold">FIREFLY FARM ADMIN</p>
          <h1 className="font-serif text-2xl font-bold text-forest-700">飛螢農莊 網站後台</h1>
        </div>

        <Field label="GitHub Fine-grained Token" hint="只授予 fireflyfarm 倉庫的 Contents: Read and write。Token 只保存在此分頁的 sessionStorage，關閉分頁即清除。">
          <input
            type="password"
            className={`${INPUT_CLASS} font-mono`}
            value={token}
            autoComplete="off"
            placeholder="github_pat_..."
            onChange={(e) => setToken(e.target.value)}
          />
        </Field>

        <details className="text-xs text-coffee/80">
          <summary className="cursor-pointer font-semibold text-forest-700">倉庫設定（通常不需更改）</summary>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <input className={`${INPUT_CLASS} font-mono`} value={repo.owner} onChange={(e) => setRepo({ ...repo, owner: e.target.value })} aria-label="owner" />
            <input className={`${INPUT_CLASS} font-mono`} value={repo.repo} onChange={(e) => setRepo({ ...repo, repo: e.target.value })} aria-label="repo" />
            <input className={`${INPUT_CLASS} font-mono`} value={repo.branch} onChange={(e) => setRepo({ ...repo, branch: e.target.value })} aria-label="branch" />
          </div>
        </details>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" className={`${BTN.primary} w-full`} disabled={busy}>
          {busy ? '驗證中…' : '登入後台'}
        </button>

        <p className="text-[11px] text-coffee/60 leading-relaxed">
          此頁面為公開靜態頁，沒有帳號密碼。唯一的保護是您手上的 Token，請勿分享。
          如何建立 Token、開啟兩步驟驗證、撤銷外洩的 Token，請看
          <a className="underline text-forest-700" href={guideUrl} target="_blank" rel="noopener noreferrer">
            老闆後台操作說明
          </a>
          。
        </p>
        <p className="text-[11px] text-coffee/40 text-right">製作者：黃政文</p>
      </form>
    </div>
  );
}
