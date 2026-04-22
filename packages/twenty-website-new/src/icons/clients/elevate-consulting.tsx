import type { ClientIconProps } from './client-icon-props';

const VIEWBOX_WIDTH = 88;
const VIEWBOX_HEIGHT = 22;

export function ElevateConsultingIcon({
  size,
  fillColor,
}: ClientIconProps) {
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
        fontSize="16"
        fontWeight="600"
        letterSpacing="-0.03em"
        textAnchor="middle"
        x={VIEWBOX_WIDTH / 2}
        y="11"
      >
        Elevate
      </text>
    </svg>
  );
}
