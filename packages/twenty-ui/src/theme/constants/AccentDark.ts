import { css } from '@emotion/react';
import { COLOR } from './Colors';

export const ACCENT_DARK = {
  primary: COLOR.blueAccent75,
  secondary: COLOR.blueAccent80,
  tertiary: COLOR.blueAccent85,
  quaternary: COLOR.blueAccent90,
  accent3570: COLOR.blueAccent70,
  accent4060: COLOR.blueAccent60,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ACCENT_DARK_CSS = css`
  --accent-primary: ${ACCENT_DARK.primary};
  --accent-secondary: ${ACCENT_DARK.secondary};
  --accent-tertiary: ${ACCENT_DARK.tertiary};
  --accent-quaternary: ${ACCENT_DARK.quaternary};
  --accent-accent3570: ${ACCENT_DARK.accent3570};
  --accent-accent4060: ${ACCENT_DARK.accent4060};
`;
