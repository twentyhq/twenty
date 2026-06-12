import { useId } from 'react';

import { ICON_INKS } from '@/tokens';

const STRIPES = [
  { fill: ICON_INKS.appleStripes.green, y: 37.45, height: 64.55 },
  { fill: ICON_INKS.appleStripes.yellow, y: 88.65, height: 26.7 },
  { fill: ICON_INKS.appleStripes.orange, y: 102, height: 26.7 },
  { fill: ICON_INKS.appleStripes.red, y: 115.35, height: 26.7 },
  { fill: ICON_INKS.appleStripes.purple, y: 128.7, height: 26.68 },
  { fill: ICON_INKS.appleStripes.blue, y: 142.06, height: 26.68 },
];

// The mockup workspace's rainbow apple (authored artwork, verbatim). The
// clip path id is instance-unique so several mounts never collide.
export function AppleRainbowMark({ sizePx = 16 }: { sizePx?: number }) {
  const clipId = useId();

  return (
    <svg
      aria-hidden
      height={sizePx}
      viewBox="0 0 89.89 104.6"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M150.97 50.8c-9.07.38-19.66 3.95-25.85 8.6-5.62 4.21-10.26 10.47-8.46 16.56 9.9.19 20.13-3.47 26.07-8.18 5.55-4.4 9.77-10.63 8.24-16.99m3.35 24.48c-15.27 0-21.72 4.49-32.31 4.49-10.92 0-19.23-4.49-32.43-4.49-12.98 0-26.77 4.88-35.51 13.21l-.16.16A24.3 24.3 0 0 0 46.88 102c-.76 4.14-.56 8.66.62 13.35a46 46 0 0 0 5.93 13.35 65 65 0 0 0 11.45 13.35c7 6.45 16.2 13.28 28.04 13.34 11.08.07 14.21-4.37 29.24-4.42s17.87 4.47 28.94 4.4c11.35-.05 20.7-7 27.67-13.32l1.98-1.83a70 70 0 0 0 10.12-11.51l.87-1.18c-9.96-2.32-17.03-6.85-20.85-12.18-3-4.18-4-8.86-2.81-13.35 1.31-4.98 5.3-9.73 12.2-13.35a45 45 0 0 1 6.52-2.76c-8.72-6.72-20.95-10.61-32.48-10.61" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`} transform="matrix(.61862 0 0 1 -28.72 -50.8)">
        <g strokeLinecap="round">
          {STRIPES.map((stripe) => (
            <rect
              fill={stripe.fill}
              height={stripe.height}
              key={stripe.fill}
              width={188.44}
              x={24.86}
              y={stripe.y}
            />
          ))}
        </g>
      </g>
    </svg>
  );
}
