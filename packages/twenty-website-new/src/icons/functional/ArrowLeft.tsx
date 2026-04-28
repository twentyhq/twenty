const ARROW_LEFT_PATH = 'M.5 5.75H14m-13.5 0L5.75 11M.5 5.75 5.75.5';

interface ArrowLeftIconProps {
  size: number;
  strokeColor: string;
  fillColor?: string;
}

export function ArrowLeftIcon({ size, strokeColor }: ArrowLeftIconProps) {
  return (
    <svg
      width={size}
      height={size * (12 / 15)}
      viewBox="0 0 15 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={ARROW_LEFT_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
