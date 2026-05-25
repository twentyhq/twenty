const PLUS_PATH = 'M1.5 7.5H13.5M7.5 13.5V1.5';

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
      overflow="visible"
      style={{ display: 'block' }}
    >
      <path
        d={PLUS_PATH}
        stroke={strokeColor}
        strokeWidth={1.25}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
