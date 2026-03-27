const PLUS_PATH = "M.5 7.25H14M7.25 14V.5";

interface PlusIconProps {
  size: number;
  strokeColor: string;
}

export function PlusIcon({ size, strokeColor }: PlusIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={PLUS_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
