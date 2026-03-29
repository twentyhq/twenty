type HistoryIconProps = { size: number; color: string };

export function HistoryIcon({ size, color }: HistoryIconProps) {
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
        d="M4 3H12C12.5523 3 13 3.44772 13 4V12C13 12.5523 12.5523 13 12 13H4C3.44772 13 3 12.5523 3 12V4C3 3.44772 3.44772 3 4 3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M6 6H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 8.5H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 11H8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
