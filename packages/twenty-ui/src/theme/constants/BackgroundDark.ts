import * as RadixColors from '@radix-ui/colors';
import DarkNoise from '@assets/themes/dark-noise.jpg';

import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BACKGROUND_DARK = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: GRAY_SCALE.gray85,
  secondary: GRAY_SCALE.gray80,
  tertiary: GRAY_SCALE.gray75,
  quaternary: GRAY_SCALE.gray70,
  invertedPrimary: GRAY_SCALE.gray20,
  invertedSecondary: GRAY_SCALE.gray35,
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
  primaryInverted: GRAY_SCALE.gray20,
  primaryInvertedHover: GRAY_SCALE.gray15,
};
