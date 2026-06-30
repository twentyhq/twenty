import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

const ink = APP_PREVIEW_STAGE.cursorLogoInk;

// The Cursor brand tile, ported verbatim from the old site's authored
// artwork (no tabler equivalent exists for a brand mark).
export function CursorLogo({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="24" height="24" rx="5" fill={ink.tile} />
      <path d="M12 4.5 L19.5 8.5 L12 12.5 L4.5 8.5 Z" fill={ink.faceTop} />
      <path d="M4.5 8.5 L12 12.5 L12 20.5 L4.5 16.5 Z" fill={ink.faceLeft} />
      <path d="M19.5 8.5 L19.5 16.5 L12 20.5 L12 12.5 Z" fill={ink.faceRight} />
      <path d="M5.2 8.2 L17.2 8.2 L12.8 12.5 Z" fill={ink.wingTop} />
      <path d="M17.2 8.2 L13.8 17 L12.8 12.5 Z" fill={ink.wingFront} />
    </svg>
  );
}
