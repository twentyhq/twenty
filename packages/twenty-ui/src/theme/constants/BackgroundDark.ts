/* eslint-disable @nx/workspace-no-hardcoded-colors */
import DarkNoise from '../assets/dark-noise.jpg';

import { COLOR } from './Colors';
import { GRAY_SCALE } from './GrayScale';
import { RGBA } from './Rgba';

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
    primary: RGBA(GRAY_SCALE.gray85, 0.5),
    secondary: RGBA(GRAY_SCALE.gray80, 0.5),
    strong: RGBA(GRAY_SCALE.gray0, 0.14),
    medium: RGBA(GRAY_SCALE.gray0, 0.1),
    light: RGBA(GRAY_SCALE.gray0, 0.06),
    lighter: RGBA(GRAY_SCALE.gray0, 0.03),
    danger: RGBA(COLOR.red, 0.08),
    blue: RGBA(COLOR.blue, 0.2),
  },
  overlayPrimary: RGBA(GRAY_SCALE.gray100, 0.8),
  overlaySecondary: RGBA(GRAY_SCALE.gray100, 0.6),
  overlayTertiary: RGBA(GRAY_SCALE.gray100, 0.4),
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  primaryInverted: GRAY_SCALE.gray20,
  primaryInvertedHover: GRAY_SCALE.gray15,
};
