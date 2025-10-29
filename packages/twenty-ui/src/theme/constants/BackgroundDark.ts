import DarkNoise from '@assets/themes/dark-noise.jpg';
import * as RadixColors from '@radix-ui/colors';

import { COLOR_DARK } from '@ui/theme/constants/ColorsDark';
import { GRAY_SCALE_DARK } from './GrayScaleDark';
import { TRANSPARENT_COLORS_DARK } from './TransparentColorsDark';

export const BACKGROUND_DARK = {
  noisy: `url(${DarkNoise.toString()});`,
  primary: GRAY_SCALE_DARK.gray1,
  secondary: GRAY_SCALE_DARK.gray2,
  tertiary: GRAY_SCALE_DARK.gray4,
  quaternary: GRAY_SCALE_DARK.gray5,
  invertedPrimary: GRAY_SCALE_DARK.gray12,
  invertedSecondary: GRAY_SCALE_DARK.gray11,
  danger: COLOR_DARK.red12,
  transparent: {
    primary: RadixColors.blackP3A.blackA7,
    secondary: RadixColors.blackP3A.blackA6,
    strong: TRANSPARENT_COLORS_DARK.gray7,
    medium: TRANSPARENT_COLORS_DARK.gray5,
    light: TRANSPARENT_COLORS_DARK.gray2,
    lighter: TRANSPARENT_COLORS_DARK.gray1,
    danger: TRANSPARENT_COLORS_DARK.red3,
    blue: TRANSPARENT_COLORS_DARK.blue4,
    orange: TRANSPARENT_COLORS_DARK.orange4,
    success: TRANSPARENT_COLORS_DARK.green4,
  },
  overlayPrimary: '#000000b8',
  overlaySecondary: '#0000005c',
  overlayTertiary: '#0000005c',
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, ${GRAY_SCALE_DARK.gray9} 0%, ${GRAY_SCALE_DARK.gray10} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, ${GRAY_SCALE_DARK.gray10} 0%, ${GRAY_SCALE_DARK.gray11} 100%)`,
  primaryInverted: GRAY_SCALE_DARK.gray12,
  primaryInvertedHover: GRAY_SCALE_DARK.gray11,
};
