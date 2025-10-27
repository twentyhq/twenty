import * as RadixColors from '@radix-ui/colors';
import LightNoise from '@assets/themes/light-noise.png';

import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';

export const BACKGROUND_LIGHT = {
  noisy: `url(${LightNoise.toString()});`,
  primary: GRAY_SCALE.gray0,
  secondary: GRAY_SCALE.gray10,
  tertiary: GRAY_SCALE.gray15,
  quaternary: GRAY_SCALE.gray20,
  invertedPrimary: GRAY_SCALE.gray60,
  invertedSecondary: GRAY_SCALE.gray50,
  danger: COLOR.red10,
  transparent: {
    primary: RadixColors.grayA.grayA6,
    secondary: RadixColors.grayA.grayA4,
    strong: RadixColors.grayA.grayA11,
    medium: RadixColors.grayA.grayA8,
    light: RadixColors.grayA.grayA4,
    lighter: RadixColors.grayA.grayA2,
    danger: RadixColors.redA.redA3,
    blue: RadixColors.blueA.blueA3,
    orange: RadixColors.orangeA.orangeA3,
  },
  overlayPrimary: RadixColors.blackA.blackA11,
  overlaySecondary: RadixColors.blackA.blackA9,
  overlayTertiary: RadixColors.blackA.blackA4,
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${RadixColors.gray.gray9} 0%, ${RadixColors.gray.gray10} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${RadixColors.gray.gray10} 0%, ${RadixColors.gray.gray11} 100%)`,
  primaryInverted: GRAY_SCALE.gray60,
  primaryInvertedHover: GRAY_SCALE.gray55,
};
