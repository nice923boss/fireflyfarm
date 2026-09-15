import { useEffect, useState } from 'react';
import { latestWorkflowRun, type RepoConfig, type WorkflowRun } from '../lib/github';

const POLL_MS = 15000;
const MAX_POLLS = 40; // ~10 minutes

interface Props {
  repo: RepoConfig;
  /** Commit sha just pushed; polling continues until a run for it finishes. */
  expectedSha: string | null;
  /** Re-fetch trigger (increment after each save). */
  refreshKey: number;
}

export function describeRun(run: WorkflowRun | null, expectedSha: string | null): { text: string; tone: 'idle' | 'busy' | 'ok' | 'fail' } {
  const waitingForNew = expectedSha !== null && run?.head_sha !== expectedSha;
  if (!run && !waitingForNew) return { text: '尚無部署紀錄', tone: 'idle' };
  if (waitingForNew || !run) return { text: '已送出，等待 GitHub Actions 開始部署…', tone: 'busy' };
  if (run.status === 'queued' || run.status === 'waiting' || run.status === 'pending') return { text: '部署排隊中…', tone: 'busy' };
  if (run.status === 'in_progress') return { text: '部署進行中…', tone: 'busy' };
  if (run.conclusion === 'success') return { text: '最近一次部署成功', tone: 'ok' };
  if (run.conclusion) return { text: `最近一次部署失敗（${run.conclusion}）`, tone: 'fail' };
  return { text: `部署狀態：${run.status}`, tone: 'idle' };
}

const TONE_CLASS = {
  idle: 'bg-cream-100 text-coffee/70 border-wood/50',
  busy: 'bg-amber-50 text-amber-800 border-amber-200',
  ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  fail: 'bg-red-50 text-red-800 border-red-200',
};

export function DeployStatus({ repo, expectedSha, refreshKey }: Props) {
  const [run, setRun] = useState<WorkflowRun | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let polls = 0;
    let timer: number | undefined;
    let cancelled = false;

    const tick = async () => {
      try {
        const latest = await latestWorkflowRun(repo);
        if (cancelled) return;
        setRun(latest);
        setError('');
        const { tone } = describeRun(latest, expectedSha);
        polls += 1;
        if (tone === 'busy' && polls < MAX_POLLS) timer = window.setTimeout(() => void tick(), POLL_MS);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : '無法讀取部署狀態');
      }
    };
    void tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [repo, expectedSha, refreshKey]);

  const { text, tone } = describeRun(run, expectedSha);
  const time = run ? new Date(run.updated_at).toLocaleString('zh-TW', { hour12: false }) : '';

  return (
    <div className={`text-xs border rounded-lg px-3 py-2 flex flex-wrap items-center gap-x-3 gap-y-1 ${TONE_CLASS[tone]}`}>
      <span className="font-semibold">{error ? `部署狀態讀取失敗：${error}` : text}</span>
      {run && (
        <>
          <span className="opacity-70">{time}</span>
          <a className="underline" href={run.html_url} target="_blank" rel="noopener noreferrer">
            查看 Actions
          </a>
        </>
      )}
    </div>
  );
}
