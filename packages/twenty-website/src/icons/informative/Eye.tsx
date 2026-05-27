type EyeIconProps = { size: number; color: string; strokeWidth?: number };

export function EyeIcon({ size, color, strokeWidth = 2 }: EyeIconProps) {
  const height = (size * 13) / 16;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 16 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9.437 5.719a1.719 1.719 0 1 1-3.437 0 1.719 1.719 0 0 1 3.437 0Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M11.458 2.363C10.38 1.583 9.07 1 7.656 1 3.98 1 1 4.94 1 6.059 1 6.77 2.207 8.626 4.033 9.88m9.265-5.765c.643.801 1.015 1.549 1.015 1.944 0 1.118-2.98 5.059-6.657 5.059a5.5 5.5 0 0 1-1.362-.177"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
