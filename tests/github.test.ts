import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  commitFiles,
  decodeBase64Utf8,
  GitHubError,
  latestWorkflowRun,
  listDirectory,
  readTextFile,
  verifyToken,
  type RepoConfig,
} from '../src/lib/github';

const cfg: RepoConfig = { owner: 'nice923boss', repo: 'fireflyfarm', branch: 'main' };
const BASE = 'https://api.github.com/repos/nice923boss/fireflyfarm';

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

let calls: Call[];
let routes: Array<[RegExp, (call: Call) => { status: number; body: unknown }]>;

function json(status: number, body: unknown) {
  return { status, body };
}

beforeEach(() => {
  calls = [];
  routes = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit = {}) => {
      const call: Call = {
        url,
        method: init.method ?? 'GET',
        headers: (init.headers as Record<string, string>) ?? {},
        body: init.body ? JSON.parse(String(init.body)) : undefined,
      };
      calls.push(call);
      const route = routes.find(([re]) => re.test(url));
      const res = route ? route[1](call) : json(500, { message: `unrouted ${url}` });
      return new Response(JSON.stringify(res.body), { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe('verifyToken', () => {
  it('accepts a token with push permission and sends it as a bearer header', async () => {
    routes.push([/\/repos\/nice923boss\/fireflyfarm$/, () => json(200, { permissions: { push: true } })]);
    const result = await verifyToken(cfg, 'github_pat_x');
    expect(result).toMatchObject({ ok: true, canPush: true });
    expect(calls[0].headers.Authorization).toBe('Bearer github_pat_x');
  });
  it('rejects read-only tokens', async () => {
    routes.push([/fireflyfarm$/, () => json(200, { permissions: { push: false } })]);
    const result = await verifyToken(cfg, 't');
    expect(result.ok).toBe(true);
    expect(result.canPush).toBe(false);
    expect(result.message).toMatch(/寫入權限/);
  });
  it('explains 401 and 404 in Chinese', async () => {
    routes.push([/fireflyfarm$/, () => json(401, { message: 'Bad credentials' })]);
    expect((await verifyToken(cfg, 't')).message).toMatch(/Token/);
    routes = [[/fireflyfarm$/, () => json(404, { message: 'Not Found' })]];
    const notFound = await verifyToken(cfg, 't');
    expect(notFound.ok).toBe(false);
    expect(notFound.message).toMatch(/找不到/);
  });
});

describe('readTextFile / listDirectory', () => {
  it('decodes base64 UTF-8 content', async () => {
    const encoded = Buffer.from('{"name":"飛螢農莊"}', 'utf8').toString('base64');
    routes.push([/\/contents\/content\/site\.json/, () => json(200, { content: encoded, encoding: 'base64' })]);
    expect(await readTextFile(cfg, 't', 'content/site.json')).toBe('{"name":"飛螢農莊"}');
    expect(decodeBase64Utf8(encoded)).toContain('飛螢農莊');
  });
  it('returns null for missing files and [] for missing directories', async () => {
    routes.push([/\/contents\//, () => json(404, { message: 'Not Found' })]);
    expect(await readTextFile(cfg, 't', 'content/nope.json')).toBeNull();
    expect(await listDirectory(cfg, 't', 'public/images')).toEqual([]);
  });
  it('lists only file names', async () => {
    routes.push([
      /\/contents\/public\/images/,
      () =>
        json(200, [
          { name: 'a.jpg', type: 'file' },
          { name: 'sub', type: 'dir' },
          { name: 'placeholder.svg', type: 'file' },
        ]),
    ]);
    expect(await listDirectory(cfg, 't', 'public/images')).toEqual(['a.jpg', 'placeholder.svg']);
  });
  it('throws GitHubError with status on other failures', async () => {
    routes.push([/\/contents\//, () => json(403, { message: 'rate limited' })]);
    await expect(readTextFile(cfg, 't', 'content/site.json')).rejects.toBeInstanceOf(GitHubError);
    await expect(readTextFile(cfg, 't', 'content/site.json')).rejects.toMatchObject({ status: 403 });
  });
});

describe('commitFiles', () => {
  it('performs the Git Data sequence and builds one tree with deletes', async () => {
    routes.push(
      [/\/git\/ref\/heads\/main$/, () => json(200, { object: { sha: 'parent-sha' } })],
      [/\/git\/commits\/parent-sha$/, () => json(200, { tree: { sha: 'base-tree' } })],
      [/\/git\/blobs$/, (c) => json(201, { sha: `blob-${(c.body as { encoding: string }).encoding}` })],
      [/\/git\/trees$/, () => json(201, { sha: 'new-tree' })],
      [/\/git\/commits$/, () => json(201, { sha: 'new-commit' })],
      [/\/git\/refs\/heads\/main$/, () => json(200, {})],
    );

    const sha = await commitFiles(cfg, 't', {
      message: 'content: update rooms',
      files: [
        { path: 'content/rooms.json', content: '{}\n', encoding: 'utf-8' },
        { path: 'public/images/1-a.jpg', content: 'AAAA', encoding: 'base64' },
      ],
      deletes: ['public/images/old.jpg'],
    });

    expect(sha).toBe('new-commit');
    expect(calls.map((c) => `${c.method} ${c.url.replace(BASE, '')}`)).toEqual([
      'GET /git/ref/heads/main',
      'GET /git/commits/parent-sha',
      'POST /git/blobs',
      'POST /git/blobs',
      'POST /git/trees',
      'POST /git/commits',
      'PATCH /git/refs/heads/main',
    ]);
    const tree = calls[4].body as { base_tree: string; tree: Array<{ path: string; sha: string | null }> };
    expect(tree.base_tree).toBe('base-tree');
    expect(tree.tree).toEqual([
      { path: 'content/rooms.json', mode: '100644', type: 'blob', sha: 'blob-utf-8' },
      { path: 'public/images/1-a.jpg', mode: '100644', type: 'blob', sha: 'blob-base64' },
      { path: 'public/images/old.jpg', mode: '100644', type: 'blob', sha: null },
    ]);
    expect(calls[5].body).toEqual({ message: 'content: update rooms', tree: 'new-tree', parents: ['parent-sha'] });
    expect(calls[6].body).toEqual({ sha: 'new-commit', force: false });
    expect(calls.every((c) => c.headers.Authorization === 'Bearer t')).toBe(true);
  });
});

describe('latestWorkflowRun', () => {
  it('reads the newest run without a token', async () => {
    routes.push([/\/actions\/runs/, () => json(200, { workflow_runs: [{ id: 9, status: 'completed', conclusion: 'success', head_sha: 'x' }] })]);
    const run = await latestWorkflowRun(cfg);
    expect(run?.id).toBe(9);
    expect(calls[0].url).toBe(`${BASE}/actions/runs?per_page=1&branch=main`);
    expect(calls[0].headers.Authorization).toBeUndefined();
  });
  it('returns null when there are no runs', async () => {
    routes.push([/\/actions\/runs/, () => json(200, { workflow_runs: [] })]);
    expect(await latestWorkflowRun(cfg)).toBeNull();
  });
});
