import { ICON_INKS } from '@/tokens';

// The mockup workspace's logo tile, as the product's navigation renders a
// workspace logo: the authored Apple silhouette, white on its black tile.
export function AppleWorkspaceMark({ sizePx = 16 }: { sizePx?: number }) {
  return (
    <svg
      aria-hidden
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill={ICON_INKS.appleTile} height="16" rx="2" width="16" />
      {/* The silhouette is authored in its own 89.89x104.6 space: the inner
          matrix is verbatim from that artwork, the outer one seats it. */}
      <g transform="translate(3.4 1.9) scale(.113)">
        <path
          d="M150.97 50.8c-9.07.38-19.66 3.95-25.85 8.6-5.62 4.21-10.26 10.47-8.46 16.56 9.9.19 20.13-3.47 26.07-8.18 5.55-4.4 9.77-10.63 8.24-16.99m3.35 24.48c-15.27 0-21.72 4.49-32.31 4.49-10.92 0-19.23-4.49-32.43-4.49-12.98 0-26.77 4.88-35.51 13.21l-.16.16A24.3 24.3 0 0 0 46.88 102c-.76 4.14-.56 8.66.62 13.35a46 46 0 0 0 5.93 13.35 65 65 0 0 0 11.45 13.35c7 6.45 16.2 13.28 28.04 13.34 11.08.07 14.21-4.37 29.24-4.42s17.87 4.47 28.94 4.4c11.35-.05 20.7-7 27.67-13.32l1.98-1.83a70 70 0 0 0 10.12-11.51l.87-1.18c-9.96-2.32-17.03-6.85-20.85-12.18-3-4.18-4-8.86-2.81-13.35 1.31-4.98 5.3-9.73 12.2-13.35a45 45 0 0 1 6.52-2.76c-8.72-6.72-20.95-10.61-32.48-10.61"
          fill={ICON_INKS.appleGlyph}
          transform="matrix(.61862 0 0 1 -28.72 -50.8)"
        />
      </g>
    </svg>
  );
}
