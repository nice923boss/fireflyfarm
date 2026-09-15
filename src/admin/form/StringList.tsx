import { BTN, INPUT_CLASS } from './fields';
import { moveItem, removeAt, replaceAt } from './ListEditor';

interface Props {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  addLabel?: string;
  hint?: string;
  multiline?: boolean;
}

/** Editable list of plain strings (equipment, bullet items, steps) with reorder and delete. */
export function StringList({ label, items, onChange, addLabel = '新增一行', hint, multiline }: Props) {
  return (
    <div>
      <span className="block text-xs font-semibold text-forest-700 mb-1">{label}</span>
      {hint && <span className="block text-[11px] text-coffee/70 mb-2">{hint}</span>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2">
            {multiline ? (
              <textarea
                className={INPUT_CLASS}
                rows={2}
                value={item}
                onChange={(e) => onChange(replaceAt(items, index, e.target.value))}
              />
            ) : (
              <input
                type="text"
                className={INPUT_CLASS}
                value={item}
                onChange={(e) => onChange(replaceAt(items, index, e.target.value))}
              />
            )}
            <button type="button" className={BTN.icon} title="上移" disabled={index === 0} onClick={() => onChange(moveItem(items, index, index - 1))}>
              ↑
            </button>
            <button
              type="button"
              className={BTN.icon}
              title="下移"
              disabled={index === items.length - 1}
              onClick={() => onChange(moveItem(items, index, index + 1))}
            >
              ↓
            </button>
            <button type="button" className={BTN.icon} title="刪除" onClick={() => onChange(removeAt(items, index))}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className={BTN.secondary} onClick={() => onChange([...items, ''])}>
          ＋ {addLabel}
        </button>
      </div>
    </div>
  );
}
