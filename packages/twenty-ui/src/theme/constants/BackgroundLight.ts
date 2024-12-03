/* eslint-disable @nx/workspace-no-hardcoded-colors */
import LightNoise from '../assets/light-noise.png';

import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';
import { RGBA } from './Rgba';

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
    primary: RGBA(GRAY_SCALE.gray0, 0.5),
    secondary: RGBA(GRAY_SCALE.gray10, 0.5),
    strong: RGBA(GRAY_SCALE.gray100, 0.16),
    medium: RGBA(GRAY_SCALE.gray100, 0.08),
    light: RGBA(GRAY_SCALE.gray100, 0.04),
    lighter: RGBA(GRAY_SCALE.gray100, 0.02),
    danger: RGBA(COLOR.red, 0.08),
    blue: RGBA(COLOR.blue, 0.08),
  },
  overlayPrimary: RGBA(GRAY_SCALE.gray80, 0.8),
  overlaySecondary: RGBA(GRAY_SCALE.gray80, 0.4),
  overlayTertiary: RGBA(GRAY_SCALE.gray80, 0.08),
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  primaryInverted: GRAY_SCALE.gray60,
  primaryInvertedHover: GRAY_SCALE.gray55,
};
