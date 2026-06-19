const CHEVRON_DOWN_PATH = 'm3 4.5 3 3 3-3';

export type ChevronDownProps = {
  sizePx?: number;
};

// A downward chevron on currentColor — the consumer sets the ink via color.
export function ChevronDown({ sizePx = 12 }: ChevronDownProps) {
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
        d={CHEVRON_DOWN_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
