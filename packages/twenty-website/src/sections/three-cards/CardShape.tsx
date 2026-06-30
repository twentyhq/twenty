import { color } from '@/tokens';

// Verbatim port of the card's tab-notched outline (the folder-tab cut on
// the top edge). Stretches with preserveAspectRatio="none" exactly as the
// old site does — a width-stable grammar version is a proposed improvement,
// not shipped unilaterally.
const FILL_PATH =
  'M0 490V4a4 4 0 0 1 4-4h288.23c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48H439a4 4 0 0 1 4 4V490a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4';

const STROKE_PATH =
  'M4 .5h288.23c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51H439a3.5 3.5 0 0 1 3.5 3.5V490a3.5 3.5 0 0 1-3.5 3.5H4A3.5 3.5 0 0 1 .5 490V4A3.5 3.5 0 0 1 4 .5Z';

export function CardShape() {
  return (
    <div
      aria-hidden
      style={{
        inset: 0,
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: -1,
      }}
    >
      <svg
        fill="none"
        height="100%"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
        viewBox="0 0 443 494"
        width="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={FILL_PATH} fill={color('white')} />
        <path d={STROKE_PATH} stroke={color('black-20')} />
      </svg>
    </div>
  );
}
