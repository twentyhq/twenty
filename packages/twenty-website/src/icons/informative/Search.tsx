type SearchIconProps = { size: number; color: string; strokeWidth?: number };

export function SearchIcon({ size, color, strokeWidth = 2 }: SearchIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx={6.5}
        cy={6.5}
        r={4.5}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path
        d="m11 11 4 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
