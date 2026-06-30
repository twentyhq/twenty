const MINUS_PATH = 'M.5 7.25H14.5';

export type MinusMarkProps = {
  sizePx?: number;
};

// The authored minus glyph (full-bleed 15 box), on currentColor.
export function MinusMark({ sizePx = 12 }: MinusMarkProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      viewBox="0 0 15 15"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={MINUS_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
}
