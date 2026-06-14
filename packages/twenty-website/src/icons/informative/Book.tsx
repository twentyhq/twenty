type BookIconProps = { size: number; color: string; strokeWidth?: number };

export function BookIcon({ size, color, strokeWidth = 1.5 }: BookIconProps) {
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
        d="M2 3h4.2c.7 0 1.4.3 1.8.9.4-.6 1.1-.9 1.8-.9H14v9H9.8c-.7 0-1.4.3-1.8.9-.4-.6-1.1-.9-1.8-.9H2V3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <path d="M8 4.5v8" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}
