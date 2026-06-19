export type TrustedByLogo = {
  // Company name (proper noun, untranslated): what a screen reader hears
  // where sighted users read the mark.
  name: string;
  src: string;
  // Intrinsic aspect ratio (measured from the asset) so each mark renders at
  // its natural proportions instead of being forced into a uniform box.
  aspectRatio: number;
  // Optical normalization: compact emblems need more height than long
  // wordmarks to read with equal visual weight.
  heightPx: number;
  grayBrightness?: number;
  grayOpacity?: number;
};

export const TRUSTED_BY_LOGOS: readonly TrustedByLogo[] = [
  {
    aspectRatio: 1.896,
    grayOpacity: 0.52,
    heightPx: 30,
    name: 'République Française',
    src: '/images/logo-bar/french-republic.webp',
  },
  {
    aspectRatio: 1,
    grayBrightness: 0.9,
    grayOpacity: 0.74,
    heightPx: 34,
    name: 'Bayer',
    src: '/images/logo-bar/bayer.webp',
  },
  {
    aspectRatio: 2,
    grayOpacity: 0.43,
    heightPx: 26,
    name: 'PwC',
    src: '/images/logo-bar/pwc.webp',
  },
  {
    aspectRatio: 1,
    grayOpacity: 0.7,
    heightPx: 34,
    name: 'Windmill',
    src: '/images/logo-bar/windmill-logo.webp',
  },
  {
    aspectRatio: 3.262,
    grayOpacity: 0.48,
    heightPx: 24,
    name: 'Fora',
    src: '/images/logo-bar/fora.svg',
  },
  {
    aspectRatio: 4.268,
    grayOpacity: 0.55,
    heightPx: 22,
    name: 'Wazoku',
    src: '/images/logo-bar/wazoku.svg',
  },
  {
    aspectRatio: 6.255,
    grayOpacity: 0.68,
    heightPx: 18,
    name: 'CivicActions',
    src: '/images/logo-bar/civicactions.svg',
  },
  {
    aspectRatio: 5.304,
    grayOpacity: 0.41,
    heightPx: 18,
    name: 'OTIIMA',
    src: '/images/logo-bar/otiima.svg',
  },
  {
    aspectRatio: 1.483,
    grayOpacity: 0.42,
    heightPx: 30,
    name: 'NIC Industries',
    src: '/images/logo-bar/nic.webp',
  },
  {
    aspectRatio: 3.814,
    grayBrightness: 0.72,
    grayOpacity: 0.74,
    heightPx: 26,
    name: 'Shiawase Home',
    src: '/images/logo-bar/shiawase-home.webp',
  },
];
