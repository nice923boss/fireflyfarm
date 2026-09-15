import { useState, type ReactNode } from 'react';
import { BTN } from './fields';

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function replaceAt<T>(items: T[], index: number, item: T): T[] {
  return items.map((existing, i) => (i === index ? item : existing));
}

export function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, i) => i !== index);
}

interface Props<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** Title shown on the collapsed header of each item. */
  itemTitle: (item: NoInfer<T>, index: number) => string;
  renderItem: (item: NoInfer<T>, update: (item: NoInfer<T>) => void, index: number) => ReactNode;
  createItem: () => NoInfer<T>;
  addLabel: string;
  /** Confirm text shown before deleting. */
  deleteConfirm?: string;
  /** Start with all items collapsed (default true). */
  collapsed?: boolean;
}

/** Ordered list of collapsible cards with add / delete / move up / move down. */
export function ListEditor<T>({
  items,
  onChange,
  itemTitle,
  renderItem,
  createItem,
  addLabel,
  deleteConfirm = '確定要刪除這個項目嗎？',
  collapsed = true,
}: Props<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(collapsed ? null : 0);

  const remove = (index: number) => {
    if (!window.confirm(deleteConfirm)) return;
    onChange(removeAt(items, index));
    setOpenIndex(null);
  };

  const move = (from: number, to: number) => {
    onChange(moveItem(items, from, to));
    setOpenIndex(to);
  };

  const add = () => {
    onChange([...items, createItem()]);
    setOpenIndex(items.length);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={index} className="rounded-xl border border-wood/60 bg-cream-50">
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                className="flex-1 text-left text-sm font-semibold text-forest-700 truncate"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
              >
                <span className="text-caramel mr-2">{open ? '▾' : '▸'}</span>
                {index + 1}. {itemTitle(item, index) || '（未命名）'}
              </button>
              <button type="button" className={BTN.icon} title="上移" disabled={index === 0} onClick={() => move(index, index - 1)}>
                ↑
              </button>
              <button
                type="button"
                className={BTN.icon}
                title="下移"
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
              >
                ↓
              </button>
              <button type="button" className={BTN.danger} onClick={() => remove(index)}>
                刪除
              </button>
            </div>
            {open && (
              <div className="border-t border-wood/40 bg-white rounded-b-xl p-4 space-y-4">
                {renderItem(item, (next) => onChange(replaceAt(items, index, next)), index)}
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className={BTN.secondary} onClick={add}>
        ＋ {addLabel}
      </button>
    </div>
  );
}
