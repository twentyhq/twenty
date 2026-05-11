import type { ClientIconProps } from './client-icon-props';

const VIEWBOX_WIDTH = 56;
const VIEWBOX_HEIGHT = 56;
const GAP = 16;
const ORIGIN = 8;
const DOT_RADIUS = 5;

export function NineDotsIcon({ size, fillColor }: ClientIconProps) {
  const height = size * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);
  const dots: { cx: number; cy: number }[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      dots.push({
        cx: ORIGIN + column * GAP,
        cy: ORIGIN + row * GAP,
      });
    }
  }

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.cx}
          cy={dot.cy}
          fill={fillColor}
          r={DOT_RADIUS}
        />
      ))}
    </svg>
  );
}
