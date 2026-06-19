const CHECK_PATH = 'm2.5 6 2.5 2.5 4.5-5';

export type CheckMarkProps = {
  sizePx?: number;
};

// The authored checkmark glyph (the pricing self-host checkbox), on
// currentColor — the consumer sets the ink via color.
export function CheckMark({ sizePx = 10 }: CheckMarkProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      style={{ display: 'block' }}
      viewBox="0 0 12 12"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={CHECK_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
