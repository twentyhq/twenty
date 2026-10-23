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
    aspectRatio: 1,
    grayOpacity: 0.42,
    heightPx: 34,
    name: 'Corgi',
    src: '/images/logo-bar/corgi.webp',
  },
  {
    aspectRatio: 1.677,
    grayOpacity: 0.42,
    heightPx: 22,
    name: 'Murphy',
    src: '/images/logo-bar/murphy.webp',
  },
  {
    aspectRatio: 7.188,
    grayOpacity: 0.5,
    heightPx: 17,
    name: 'Frankfurter Allgemeine Zeitung',
    src: '/images/logo-bar/faz.svg',
  },
  {
    aspectRatio: 4.268,
    grayOpacity: 0.55,
    heightPx: 22,
    name: 'Wazoku',
    src: '/images/logo-bar/wazoku.svg',
  },
  {
    aspectRatio: 2.588,
    grayOpacity: 0.6,
    heightPx: 26,
    name: 'Żabka',
    src: '/images/logo-bar/zabka.svg',
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
