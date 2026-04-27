const ARROW_RIGHT_PATH = 'M14 5.75H.5m13.5 0L8.75.5M14 5.75 8.75 11';

interface ArrowRightIconProps {
  size: number;
  strokeColor: string;
  fillColor?: string;
}

export function ArrowRightIcon({ size, strokeColor }: ArrowRightIconProps) {
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
        d={ARROW_RIGHT_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
