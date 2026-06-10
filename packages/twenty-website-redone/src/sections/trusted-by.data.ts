export type TrustedByLogo = {
  src: string;
  fit?: 'contain' | 'cover';
  grayBrightness?: number;
  grayOpacity?: number;
};

// Per-logo grayscale tuning normalizes visual weight across brand marks.
export const TRUSTED_BY_LOGOS: readonly TrustedByLogo[] = [
  { grayOpacity: 0.52, src: '/images/logo-bar/french-republic.webp' },
  {
    grayBrightness: 0.9,
    grayOpacity: 0.74,
    src: '/images/logo-bar/bayer.webp',
  },
  { fit: 'cover', grayOpacity: 0.43, src: '/images/logo-bar/pwc.webp' },
  { grayOpacity: 0.7, src: '/images/logo-bar/windmill-logo.webp' },
  { grayOpacity: 0.48, src: '/images/logo-bar/fora.svg' },
  { grayOpacity: 0.55, src: '/images/logo-bar/wazoku.svg' },
  { grayOpacity: 0.68, src: '/images/logo-bar/civicactions.svg' },
  { grayOpacity: 0.41, src: '/images/logo-bar/otiima.svg' },
  { grayOpacity: 0.42, src: '/images/logo-bar/nic.webp' },
  {
    grayBrightness: 0.72,
    grayOpacity: 0.74,
    src: '/images/logo-bar/shiawase-home.webp',
  },
];
