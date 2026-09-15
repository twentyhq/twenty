const ARROW_LEFT_PATH = 'M1 5.75h13.5M1 5.75 6.25.5M1 5.75 6.25 11';

export type ArrowLeftProps = {
  sizePx?: number;
};

// Mirror of the authored thin arrow, on currentColor.
export function ArrowLeft({ sizePx = 14 }: ArrowLeftProps) {
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
        d={ARROW_LEFT_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
}
