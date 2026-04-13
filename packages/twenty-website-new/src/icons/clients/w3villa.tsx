import type { ClientIconProps } from './client-icon-props';

const VIEWBOX_WIDTH = 76;
const VIEWBOX_HEIGHT = 22;

export function W3villaIcon({ size, fillColor }: ClientIconProps) {
  const height = size * (VIEWBOX_HEIGHT / VIEWBOX_WIDTH);

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        dominantBaseline="central"
        fill={fillColor}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        fontSize="15"
        fontWeight="600"
        letterSpacing="-0.02em"
        x="0"
        y="11"
      >
        W3villa
      </text>
    </svg>
  );
}
