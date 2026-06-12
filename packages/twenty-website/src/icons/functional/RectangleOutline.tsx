interface RectangleOutlineIconProps {
  size: number;
  strokeColor: string;
}

export function RectangleOutlineIcon({
  size,
  strokeColor,
}: RectangleOutlineIconProps) {
  return (
    <svg
      width={size}
      height={size * (7 / 14)}
      viewBox="0 0 14 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={0.5}
        y={0.5}
        width={13}
        height={6}
        rx={0.5}
        stroke={strokeColor}
        strokeWidth={1}
      />
    </svg>
  );
}
