const ARROW_RIGHT_UP_PATH =
  "M6.069.5.5 6.068M6.069.5H1.738m4.33 0v4.331";

interface ArrowRightUpIconProps {
  size: number;
  strokeColor: string;
}

export function ArrowRightUpIcon({
  size,
  strokeColor,
}: ArrowRightUpIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 6.569 6.568"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={ARROW_RIGHT_UP_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
