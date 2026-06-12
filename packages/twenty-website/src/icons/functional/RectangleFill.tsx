interface RectangleFillIconProps {
  fillColor: string;
  height?: number;
  size?: number;
  width?: number;
}

export function RectangleFillIcon({
  size,
  fillColor,
  width = size ?? 14,
  height = size ? size * (7 / 14) : 7,
}: RectangleFillIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={width} height={height} rx={1} fill={fillColor} />
    </svg>
  );
}
