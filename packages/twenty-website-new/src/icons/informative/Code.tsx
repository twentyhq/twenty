type CodeIconProps = { size: number; color: string; strokeWidth?: number };

export function CodeIcon({
  size,
  color,
  strokeWidth = 1.5,
}: CodeIconProps) {
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
        d="m5 4-3 4 3 4M11 4l3 4-3 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
