type TagIconProps = { size: number; color: string; strokeWidth?: number };

export function TagIcon({
  size,
  color,
  strokeWidth = 1.5,
}: TagIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M2 2h5l7 7-5 5-7-7V2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <circle cx={5} cy={5} r={1} fill={color} />
    </svg>
  );
}
