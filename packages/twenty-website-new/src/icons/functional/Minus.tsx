const MINUS_PATH = "M.5 7.25H14.5";

interface MinusIconProps {
  size: number;
  strokeColor: string;
}

export function MinusIcon({ size, strokeColor }: MinusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={MINUS_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
