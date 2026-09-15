import { parseInline } from '../lib/inline';

/** Renders text with `**bold**` markers as <strong>. */
export function Inline({ text, boldClass = 'font-bold' }: { text: string; boldClass?: string }) {
  return (
    <>
      {parseInline(text).map((run, i) =>
        run.bold ? (
          <strong key={i} className={boldClass}>
            {run.text}
          </strong>
        ) : (
          <span key={i}>{run.text}</span>
        ),
      )}
    </>
  );
}
