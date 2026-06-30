const ARROW_RIGHT_PATH = 'M14 5.75H.5m13.5 0L8.75.5M14 5.75 8.75 11';

export type ArrowRightProps = {
  sizePx?: number;
};

// Authored thin arrow (full-bleed 15x12 box, round caps), on currentColor.
export function ArrowRight({ sizePx = 14 }: ArrowRightProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx * (12 / 15)}
      viewBox="0 0 15 12"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={ARROW_RIGHT_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
}
