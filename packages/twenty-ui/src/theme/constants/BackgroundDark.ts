import DarkNoise from '@assets/themes/dark-noise.jpg';
import * as RadixColors from '@radix-ui/colors';

import { COLOR } from './Colors';
import { GRAY_SCALE_DARK } from './GrayScaleDark';

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
    primary: RadixColors.grayDarkA.grayA6,
    secondary: RadixColors.grayDarkA.grayA4,
    strong: RadixColors.grayDarkA.grayA11,
    medium: RadixColors.grayDarkA.grayA8,
    light: RadixColors.grayDarkA.grayA4,
    lighter: RadixColors.grayDarkA.grayA2,
    danger: RadixColors.redDarkA.redA3,
    blue: RadixColors.blueDarkA.blueA4,
    orange: RadixColors.orangeDarkA.orangeA4,
  },
  overlayPrimary: RadixColors.blackA.blackA11,
  overlaySecondary: RadixColors.blackA.blackA10,
  overlayTertiary: RadixColors.blackA.blackA6,
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${RadixColors.grayDark.gray9} 0%, ${RadixColors.grayDark.gray10} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${RadixColors.grayDark.gray10} 0%, ${RadixColors.grayDark.gray11} 100%)`,
  primaryInverted: GRAY_SCALE_DARK.gray12,
  primaryInvertedHover: GRAY_SCALE_DARK.gray11,
};
