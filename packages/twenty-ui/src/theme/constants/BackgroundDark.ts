/* eslint-disable @nx/workspace-no-hardcoded-colors */
import DarkNoise from '@assets/themes/dark-noise.jpg';

import { css } from '@linaria/core';
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
    orange: RGBA(COLOR.orange, 0.2),
  },
  overlayPrimary: RGBA(GRAY_SCALE.gray100, 0.8),
  overlaySecondary: RGBA(GRAY_SCALE.gray100, 0.6),
  overlayTertiary: RGBA(GRAY_SCALE.gray100, 0.4),
  radialGradient: `radial-gradient(50% 62.62% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  radialGradientHover: `radial-gradient(76.32% 95.59% at 50% 0%, #505050 0%, ${GRAY_SCALE.gray60} 100%)`,
  primaryInverted: GRAY_SCALE.gray20,
  primaryInvertedHover: GRAY_SCALE.gray15,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const BACKGROUND_DARK_CSS = css`
  --background-danger: ${BACKGROUND_DARK.danger};
  --background-invertedPrimary: ${BACKGROUND_DARK.invertedPrimary};
  --background-invertedSecondary: ${BACKGROUND_DARK.invertedSecondary};
  --background-noisy: ${BACKGROUND_DARK.noisy};
  --background-primary: ${BACKGROUND_DARK.primary};
  --background-quaternary: ${BACKGROUND_DARK.quaternary};
  --background-secondary: ${BACKGROUND_DARK.secondary};
  --background-tertiary: ${BACKGROUND_DARK.tertiary};
  --background-transparent-light: ${BACKGROUND_DARK.transparent.light};
  --background-transparent-lighter: ${BACKGROUND_DARK.transparent.lighter};
  --background-transparent-medium: ${BACKGROUND_DARK.transparent.medium};
  --background-transparent-primary: ${BACKGROUND_DARK.transparent.primary};
  --background-transparent-secondary: ${BACKGROUND_DARK.transparent.secondary};
  --background-transparent-strong: ${BACKGROUND_DARK.transparent.strong};
  --background-radialGradient: ${BACKGROUND_DARK.radialGradient};
  --background-radialGradientHover: ${BACKGROUND_DARK.radialGradientHover};
  --background-overlayPrimary: ${BACKGROUND_DARK.overlayPrimary};
  --background-overlaySecondary: ${BACKGROUND_DARK.overlaySecondary};
  --background-overlayTertiary: ${BACKGROUND_DARK.overlayTertiary};
  --background-primaryInverted: ${BACKGROUND_DARK.primaryInverted};
  --background-primaryInvertedHover: ${BACKGROUND_DARK.primaryInvertedHover};
  --background-transparent-danger: ${BACKGROUND_DARK.transparent.danger};
  --background-transparent-blue: ${BACKGROUND_DARK.transparent.blue};
  --background-transparent-orange: ${BACKGROUND_DARK.transparent.orange};
`;
