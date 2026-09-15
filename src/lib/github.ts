/**
 * Minimal GitHub REST client used by the admin, running entirely in the browser.
 * Reads use the Contents API; writes use the Git Data API so JSON + images land in one commit.
 * The token is passed in per call and never stored here.
 */

export interface RepoConfig {
  owner: string;
  repo: string;
  branch: string;
}

export interface CommitFile {
  path: string;
  /** UTF-8 text (JSON) or base64 (binary). */
  content: string;
  encoding: 'utf-8' | 'base64';
}

export interface CommitRequest {
  message: string;
  files: CommitFile[];
  deletes: string[];
}

export interface WorkflowRun {
  id: number;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  head_sha: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'GitHubError';
  }
}

const API = 'https://api.github.com';

async function request<T>(path: string, token: string | null, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API}${path}`, { ...init, headers });
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { message?: string };
      detail = body.message ?? '';
    } catch {
      /* non-JSON error body */
    }
    throw new GitHubError(detail || `GitHub API ${res.status}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function repoPath(cfg: RepoConfig): string {
  return `/repos/${cfg.owner}/${cfg.repo}`;
}

/** Decodes the base64 payload returned by the Contents API into a UTF-8 string. */
export function decodeBase64Utf8(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export interface TokenCheck {
  ok: boolean;
  canPush: boolean;
  message: string;
}

/** Confirms the token can see the repo and has push (Contents: write) access. */
export async function verifyToken(cfg: RepoConfig, token: string): Promise<TokenCheck> {
  try {
    const repo = await request<{ permissions?: { push?: boolean } }>(repoPath(cfg), token);
    const canPush = repo.permissions?.push === true;
    return {
      ok: true,
      canPush,
      message: canPush ? '' : 'Token 沒有此倉庫的 Contents 寫入權限，請重新建立 Token。',
    };
  } catch (err) {
    const status = err instanceof GitHubError ? err.status : 0;
    const message =
      status === 401
        ? 'Token 無效或已過期。'
        : status === 404
          ? '找不到倉庫，或 Token 未授權此倉庫。'
          : `無法連線 GitHub（${err instanceof Error ? err.message : '未知錯誤'}）。`;
    return { ok: false, canPush: false, message };
  }
}

/** Reads a text file from the repo. Returns null when the file does not exist. */
export async function readTextFile(cfg: RepoConfig, token: string | null, path: string): Promise<string | null> {
  try {
    const file = await request<{ content: string; encoding: string }>(
      `${repoPath(cfg)}/contents/${path}?ref=${encodeURIComponent(cfg.branch)}`,
      token,
    );
    return decodeBase64Utf8(file.content);
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return null;
    throw err;
  }
}

/** Lists file names inside a repo directory. Returns [] when the directory is missing. */
export async function listDirectory(cfg: RepoConfig, token: string | null, dir: string): Promise<string[]> {
  try {
    const entries = await request<Array<{ name: string; type: string }>>(
      `${repoPath(cfg)}/contents/${dir}?ref=${encodeURIComponent(cfg.branch)}`,
      token,
    );
    return entries.filter((e) => e.type === 'file').map((e) => e.name);
  } catch (err) {
    if (err instanceof GitHubError && err.status === 404) return [];
    throw err;
  }
}

/** Creates one commit on the branch containing all file writes and deletes. Returns the commit sha. */
export async function commitFiles(cfg: RepoConfig, token: string, req: CommitRequest): Promise<string> {
  const base = repoPath(cfg);
  const ref = await request<{ object: { sha: string } }>(`${base}/git/ref/heads/${cfg.branch}`, token);
  const parentSha = ref.object.sha;
  const parent = await request<{ tree: { sha: string } }>(`${base}/git/commits/${parentSha}`, token);

  const tree: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string | null }> = [];
  for (const file of req.files) {
    const blob = await request<{ sha: string }>(`${base}/git/blobs`, token, {
      method: 'POST',
      body: JSON.stringify({ content: file.content, encoding: file.encoding }),
    });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  for (const path of req.deletes) tree.push({ path, mode: '100644', type: 'blob', sha: null });

  const newTree = await request<{ sha: string }>(`${base}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await request<{ sha: string }>(`${base}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({ message: req.message, tree: newTree.sha, parents: [parentSha] }),
  });
  await request(`${base}/git/refs/heads/${cfg.branch}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}

/** Latest workflow run on the branch. Unauthenticated: the fine-grained token has no Actions scope. */
export async function latestWorkflowRun(cfg: RepoConfig): Promise<WorkflowRun | null> {
  const data = await request<{ workflow_runs: WorkflowRun[] }>(
    `${repoPath(cfg)}/actions/runs?per_page=1&branch=${encodeURIComponent(cfg.branch)}`,
    null,
  );
  return data.workflow_runs[0] ?? null;
}
