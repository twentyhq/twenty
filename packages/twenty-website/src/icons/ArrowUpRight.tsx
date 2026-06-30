const ARROW_PATH = 'M6.069.5.5 6.068M6.069.5H1.738m4.33 0v4.331';

export type ArrowUpRightProps = {
  sizePx?: number;
};

// The brand's thin external-link arrow (ported geometry). Colors via
// currentColor so the surrounding text styles drive it.
export function ArrowUpRight({ sizePx = 8 }: ArrowUpRightProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      viewBox="0 0 6.569 6.568"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={ARROW_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      />
    </svg>
  );
}
