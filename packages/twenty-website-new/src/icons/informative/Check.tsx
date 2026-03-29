type CheckIconProps = { size: number; color: string };

export function CheckIcon({ size, color }: CheckIconProps) {
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
        d="m11 6-3.75 4L5 8"
        stroke={color}
        strokeWidth={2}
      />
      <path
        d="M8 14a6 6 0 1 0-4.243-1.757"
        stroke={color}
        strokeWidth={2}
      />
    </svg>
  );
}
