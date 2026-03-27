interface RectangleFillIconProps {
  size: number;
  fillColor: string;
}

export function RectangleFillIcon({ size, fillColor }: RectangleFillIconProps) {
  return (
    <svg
      width={size}
      height={size * (7 / 14)}
      viewBox="0 0 14 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={14} height={7} rx={1} fill={fillColor} />
    </svg>
  );
}
