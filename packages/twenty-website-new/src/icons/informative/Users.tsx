type UsersIconProps = { size: number; color: string; strokeWidth?: number };

export function UsersIcon({ size, color, strokeWidth = 1.5 }: UsersIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx={6} cy={5.5} r={2} stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M2.5 13c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle
        cx={11.5}
        cy={6}
        r={1.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M10.5 9.5c1.9.2 3.3 1.8 3 3.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  );
}
