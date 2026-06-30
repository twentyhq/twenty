import { CLIENT_LOGOS, type ClientLogoKey } from './client-logo-config';

const WORDMARK_VIEWBOX_HEIGHT = 22;
const WORDMARK_FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
const WORDMARK_FONT_WEIGHT = 600;

const DOTS_VIEWBOX = 56;
const DOTS_GAP = 16;
const DOTS_ORIGIN = 8;
const DOTS_RADIUS = 5;
const DOTS_PER_AXIS = 3;

const DOTS = Array.from(
  { length: DOTS_PER_AXIS * DOTS_PER_AXIS },
  (_, cell) => ({
    cx: DOTS_ORIGIN + (cell % DOTS_PER_AXIS) * DOTS_GAP,
    cy: DOTS_ORIGIN + Math.floor(cell / DOTS_PER_AXIS) * DOTS_GAP,
  }),
);

export type ClientLogoProps = {
  client: ClientLogoKey;
  sizePx: number;
};

// Drawn on currentColor — the catalog thumbnail sets it white over the cover.
export function ClientLogo({ client, sizePx }: ClientLogoProps) {
  const logo = CLIENT_LOGOS[client];

  if (logo.kind === 'dots') {
    return (
      <svg
        fill="none"
        height={sizePx}
        viewBox={`0 0 ${DOTS_VIEWBOX} ${DOTS_VIEWBOX}`}
        width={sizePx}
        xmlns="http://www.w3.org/2000/svg"
      >
        {DOTS.map((dot) => (
          <circle
            cx={dot.cx}
            cy={dot.cy}
            fill="currentColor"
            key={`${dot.cx}-${dot.cy}`}
            r={DOTS_RADIUS}
          />
        ))}
      </svg>
    );
  }

  const height = sizePx * (WORDMARK_VIEWBOX_HEIGHT / logo.viewBoxWidth);

  return (
    <svg
      fill="none"
      height={height}
      viewBox={`0 0 ${logo.viewBoxWidth} ${WORDMARK_VIEWBOX_HEIGHT}`}
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        dominantBaseline="central"
        fill="currentColor"
        fontFamily={WORDMARK_FONT_FAMILY}
        fontSize={logo.fontSizePx}
        fontWeight={WORDMARK_FONT_WEIGHT}
        letterSpacing={logo.letterSpacing}
        textAnchor="middle"
        x={logo.viewBoxWidth / 2}
        y={WORDMARK_VIEWBOX_HEIGHT / 2}
      >
        {logo.text}
      </text>
    </svg>
  );
}
