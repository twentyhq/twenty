const PLUS_PATH = 'M1.5 7.5H13.5M7.5 13.5V1.5';

export type PlusMarkProps = {
  sizePx?: number;
};

// The authored plus glyph (arms span 80% of the box — visibly larger than
// tabler's 24-grid plus at the same size), on currentColor.
export function PlusMark({ sizePx = 12 }: PlusMarkProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      overflow="visible"
      style={{ display: 'block' }}
      viewBox="0 0 15 15"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={PLUS_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.25}
      />
    </svg>
  );
}
