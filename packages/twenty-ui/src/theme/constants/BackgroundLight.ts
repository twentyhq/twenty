import LightNoise from '@assets/themes/light-noise.png';
import * as RadixColors from '@radix-ui/colors';

import { COLOR } from './Colors';
import { GRAY_SCALE_LIGHT } from './GrayScaleLight';
import { GRAY_SCALE_LIGHT_ALPHA } from './GrayScaleLightAlpha';

export const BACKGROUND_LIGHT = {
  noisy: `url(${LightNoise.toString()});`,
  primary: GRAY_SCALE_LIGHT.gray1,
  secondary: GRAY_SCALE_LIGHT.gray2,
  tertiary: GRAY_SCALE_LIGHT.gray4,
  quaternary: GRAY_SCALE_LIGHT.gray5,
  invertedPrimary: GRAY_SCALE_LIGHT.gray12,
  invertedSecondary: GRAY_SCALE_LIGHT.gray11,
  danger: COLOR.red10,
  transparent: {
    primary: GRAY_SCALE_LIGHT_ALPHA.gray6,
    secondary: GRAY_SCALE_LIGHT_ALPHA.gray4,
    strong: GRAY_SCALE_LIGHT_ALPHA.gray7,
    medium: GRAY_SCALE_LIGHT_ALPHA.gray5,
    light: GRAY_SCALE_LIGHT_ALPHA.gray2,
    lighter: GRAY_SCALE_LIGHT_ALPHA.gray1,
    danger: RadixColors.redA.redA3,
    blue: RadixColors.blueA.blueA3,
    orange: RadixColors.orangeA.orangeA3,
  },
  overlayPrimary: GRAY_SCALE_LIGHT_ALPHA.gray11,
  overlaySecondary: GRAY_SCALE_LIGHT_ALPHA.gray9,
  overlayTertiary: GRAY_SCALE_LIGHT_ALPHA.gray4,
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${RadixColors.gray.gray9} 0%, ${RadixColors.gray.gray10} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${RadixColors.gray.gray10} 0%, ${RadixColors.gray.gray11} 100%)`,
  primaryInverted: GRAY_SCALE_LIGHT.gray12,
  primaryInvertedHover: GRAY_SCALE_LIGHT.gray11,
};
