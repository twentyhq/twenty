const CLOSE_PATH = 'm.5.5 9.546 9.546m-9.546 0L10.046.5';

interface CloseIconProps {
  size: number;
  strokeColor: string;
}

export function CloseIcon({ size, strokeColor }: CloseIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10.546 10.546"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={CLOSE_PATH}
        stroke={strokeColor}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
