import type { TrustedByDataType } from '@/sections/TrustedBy/types';

export const TRUSTED_BY_DATA: TrustedByDataType = {
  clientCountLabel: { text: '+10k others' },
  logos: [
    { grayOpacity: 0.52, src: '/images/home/logo-bar/french-republic.webp' },
    {
      grayBrightness: 0.9,
      grayOpacity: 0.74,
      src: '/images/home/logo-bar/bayer.webp',
    },
    {
      fit: 'cover',
      grayOpacity: 0.43,
      src: '/images/home/logo-bar/pwc.webp',
    },
    {
      grayOpacity: 0.7,
      src: '/images/home/logo-bar/windmill-logo.png',
    },
    { grayOpacity: 0.48, src: '/images/home/logo-bar/fora.svg' },
    { grayOpacity: 0.55, src: '/images/home/logo-bar/wazoku.svg' },
    { grayOpacity: 0.68, src: '/images/home/logo-bar/civicactions.svg' },
    { grayOpacity: 0.41, src: '/images/home/logo-bar/otiima.svg' },
    { grayOpacity: 0.42, src: '/images/home/logo-bar/nic.webp' },
    {
      grayBrightness: 0.72,
      grayOpacity: 0.74,
      src: '/images/home/logo-bar/shiawase-home.webp',
    },
  ],
  separator: { text: 'trusted by' },
};
