import type { Block } from '../content/schema';
import { Inline } from './Inline';
import { LinkButton } from './LinkButton';

const P_TONE: Record<string, string> = {
  normal: 'text-coffee leading-relaxed',
  muted: 'text-xs text-coffee/80',
  note: 'text-xs text-caramel italic',
  accent: 'text-forest-700 font-medium',
  small: 'text-xs text-coffee/90',
};

const BOX_TONE = {
  cream: { box: 'bg-cream-50 p-4 rounded-xl border border-wood/40', title: 'text-forest-700' },
  amber: { box: 'bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900', title: 'text-amber-900' },
  red: { box: 'bg-red-50/60 p-4 rounded-xl border border-red-200 text-red-900', title: 'text-red-900' },
  emerald: { box: 'bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-emerald-900', title: 'text-emerald-900' },
  sky: { box: 'bg-sky-50/70 p-4 rounded-xl border border-sky-200 text-sky-900', title: 'text-sky-900' },
} as const;

const BADGE_TONE = {
  caramel: 'bg-caramel text-white text-[10px] px-2 py-0.5 rounded ml-2 align-middle',
  forest: 'bg-forest-700 text-white text-[10px] px-2 py-0.5 rounded ml-2 align-middle',
} as const;

const BUTTON_STYLE = {
  forest: 'flex-1 py-3 px-5 bg-forest-700 text-white rounded-xl text-xs sm:text-sm font-semibold text-center hover:bg-forest-800 transition-colors',
  emerald: 'flex-1 py-3 px-5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold text-center hover:bg-emerald-700 transition-colors',
} as const;

/** A line starting with "## " renders as a caramel sub-heading inside a box. */
function BoxLine({ line }: { line: string }) {
  if (line.startsWith('## ')) {
    return <p className="text-xs font-bold text-caramel mt-3 first:mt-0">{line.slice(3)}</p>;
  }
  return (
    <p>
      <Inline text={line} />
    </p>
  );
}

export function RichBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return (
        <p className={P_TONE[block.tone ?? 'normal']}>
          <Inline text={block.text} />
        </p>
      );

    case 'box': {
      const tone = BOX_TONE[block.tone];
      return (
        <div className={`${tone.box} space-y-2`}>
          {block.title && (
            <p className={`font-bold text-sm ${tone.title}`}>
              <Inline text={block.title} />
              {block.badge && <span className={BADGE_TONE[block.badgeTone ?? 'caramel']}>{block.badge}</span>}
            </p>
          )}
          {block.list ? (
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {block.lines.map((line, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-caramel mr-1.5">•</span>
                  <span>
                    <Inline text={line} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs sm:text-sm space-y-1.5">
              {block.lines.map((line, i) => (
                <BoxLine key={i} line={line} />
              ))}
            </div>
          )}
          {block.note && (
            <p className="text-xs text-caramel italic">
              <Inline text={block.note} />
            </p>
          )}
          {block.button && (
            <LinkButton
              link={block.button}
              className="inline-block bg-forest-700 text-white font-mono px-3 py-1 rounded-lg font-bold text-xs hover:bg-forest-800 transition-colors"
            >
              {block.button.label}
            </LinkButton>
          )}
        </div>
      );
    }

    case 'stats': {
      const single = block.items.length === 1;
      return (
        <div className={single ? '' : 'grid sm:grid-cols-2 gap-3'}>
          {block.items.map((item, i) => (
            <div
              key={i}
              className={`bg-cream-50 p-3 rounded-xl border border-wood/40 ${single ? 'inline-block pr-6' : ''}`}
            >
              <span className="text-xs text-caramel font-semibold block">{item.label}</span>
              <span className={`${single ? 'text-xl' : 'text-base'} font-bold text-forest-700`}>{item.value}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'items':
      return (
        <div className="space-y-2">
          {block.items.map((item, i) => (
            <div key={i} className="flex items-center p-2 rounded-lg bg-cream-50 border border-wood/30">
              <span className="text-lg mr-2.5">{item.icon}</span>
              <span className="text-xs sm:text-sm">
                <Inline text={item.text} />
              </span>
            </div>
          ))}
        </div>
      );

    case 'contact':
      return (
        <div className="bg-cream-50 p-4 rounded-xl border border-wood/40 space-y-2 text-xs sm:text-sm font-medium">
          {block.rows.map((row, i) => (
            <p key={i} className="flex items-start">
              <span className="w-16 text-caramel font-bold shrink-0">{row.label}</span>
              <LinkButton link={row} className="text-forest-700 hover:underline">
                {row.text}
              </LinkButton>
            </p>
          ))}
          {block.note && (
            <p className="text-xs text-coffee/80 font-normal pt-1">
              <Inline text={block.note} />
            </p>
          )}
        </div>
      );

    case 'buttons':
      return (
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {block.buttons.map((button, i) => (
            <LinkButton key={i} link={button} className={BUTTON_STYLE[button.style ?? 'forest']}>
              {button.label}
            </LinkButton>
          ))}
        </div>
      );
  }
}

export function RichBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <RichBlock key={i} block={block} />
      ))}
    </div>
  );
}
