import { css } from '@emotion/react';
import { COLOR } from './Colors';

export const ACCENT_LIGHT = {
  primary: COLOR.blueAccent25,
  secondary: COLOR.blueAccent20,
  tertiary: COLOR.blueAccent15,
  quaternary: COLOR.blueAccent10,
  accent3570: COLOR.blueAccent35,
  accent4060: COLOR.blueAccent40,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const ACCENT_LIGHT_CSS = css`
  --accent-primary: ${ACCENT_LIGHT.primary};
  --accent-secondary: ${ACCENT_LIGHT.secondary};
  --accent-tertiary: ${ACCENT_LIGHT.tertiary};
  --accent-quaternary: ${ACCENT_LIGHT.quaternary};
  --accent-accent3570: ${ACCENT_LIGHT.accent3570};
  --accent-accent4060: ${ACCENT_LIGHT.accent4060};
`;
