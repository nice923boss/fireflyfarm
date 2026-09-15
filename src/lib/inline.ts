export interface InlineRun {
  text: string;
  bold: boolean;
}

/** Splits `**bold**` markers into runs. Unbalanced markers are kept as literal text. */
export function parseInline(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index), bold: false });
    runs.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last), bold: false });
  return runs;
}

/** Text with `**` markers removed, for places that need plain strings (alt text, admin previews). */
export function stripInline(text: string): string {
  return parseInline(text)
    .map((r) => r.text)
    .join('');
}
