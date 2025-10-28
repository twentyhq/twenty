import DarkNoise from '@assets/themes/dark-noise.jpg';
import * as RadixColors from '@radix-ui/colors';

import { RGBA } from '@ui/theme/constants/Rgba';
import { COLOR } from './Colors';
import { GRAY_SCALE_DARK } from './GrayScaleDark';
import { GRAY_SCALE_DARK_ALPHA } from './GrayScaleDarkAlpha';

export const BACKGROUND_DARK = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: GRAY_SCALE_DARK.gray1,
  secondary: GRAY_SCALE_DARK.gray2,
  tertiary: GRAY_SCALE_DARK.gray4,
  quaternary: GRAY_SCALE_DARK.gray5,
  invertedPrimary: GRAY_SCALE_DARK.gray12,
  invertedSecondary: GRAY_SCALE_DARK.gray11,
  danger: COLOR.red80,
  transparent: {
    primary: RGBA(GRAY_SCALE_DARK.gray1, 0.5),
    secondary: RGBA(GRAY_SCALE_DARK.gray2, 0.5),
    strong: GRAY_SCALE_DARK_ALPHA.gray7,
    medium: GRAY_SCALE_DARK_ALPHA.gray5,
    light: GRAY_SCALE_DARK_ALPHA.gray2,
    lighter: GRAY_SCALE_DARK_ALPHA.gray1,
    danger: RadixColors.redDarkA.redA3,
    blue: RadixColors.blueDarkA.blueA4,
    orange: RadixColors.orangeDarkA.orangeA4,
  },
  overlayPrimary: '#000000b8',
  overlaySecondary: '#0000005c',
  overlayTertiary: '#0000005c',
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${GRAY_SCALE_DARK.gray9} 0%, ${GRAY_SCALE_DARK.gray10} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${GRAY_SCALE_DARK.gray10} 0%, ${GRAY_SCALE_DARK.gray11} 100%)`,
  primaryInverted: GRAY_SCALE_DARK.gray12,
  primaryInvertedHover: GRAY_SCALE_DARK.gray11,
};
