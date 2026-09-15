import type { ReactNode } from 'react';

export const INPUT_CLASS =
  'w-full rounded-lg border border-wood/70 bg-white px-3 py-2 text-sm text-coffee focus:outline-none focus:ring-2 focus:ring-forest-600/40 focus:border-forest-600';

export const BTN = {
  primary: 'px-4 py-2 rounded-lg bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
  secondary: 'px-3 py-1.5 rounded-lg border border-wood bg-white text-coffee text-xs font-semibold hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors',
  danger: 'px-3 py-1.5 rounded-lg border border-red-300 bg-white text-red-700 text-xs font-semibold hover:bg-red-50 disabled:opacity-40 transition-colors',
  icon: 'w-8 h-8 rounded-lg border border-wood bg-white text-coffee text-sm hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors',
} as const;

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-forest-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-coffee/70 mt-1">{hint}</span>}
    </label>
  );
}

interface TextProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  mono?: boolean;
}

export function TextInput({ label, value, onChange, hint, placeholder, mono }: TextProps) {
  return (
    <Field label={label} hint={hint}>
      <input
        type="text"
        className={`${INPUT_CLASS} ${mono ? 'font-mono' : ''}`}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({ label, value, onChange, hint, placeholder, rows = 3 }: TextProps & { rows?: number }) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        className={INPUT_CLASS}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <select className={INPUT_CLASS} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold text-forest-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      {label}
    </label>
  );
}

export function Card({ title, children, actions }: { title?: ReactNode; children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-wood/60 p-5 space-y-4">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-wood/30 pb-3">
          <h3 className="font-serif font-bold text-forest-700">{title}</h3>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function Grid({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 }) {
  return <div className={cols === 3 ? 'grid sm:grid-cols-3 gap-4' : 'grid sm:grid-cols-2 gap-4'}>{children}</div>;
}
