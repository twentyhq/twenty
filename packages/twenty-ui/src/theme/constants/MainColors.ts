/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { css } from '@linaria/core';
import { GRAY_SCALE } from './GrayScale';

export const MAIN_COLORS = {
  green: '#55ef3c',
  turquoise: '#15de8f',
  sky: '#00e0ff',
  blue: '#1961ed',
  purple: '#915ffd',
  pink: '#f54bd0',
  red: '#f83e3e',
  orange: '#ff7222',
  yellow: '#ffd338',
  gray: GRAY_SCALE.gray30,
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const MAIN_COLORS_CSS = css`
  --main-color-green: ${MAIN_COLORS.green};
  --main-color-turquoise: ${MAIN_COLORS.turquoise};
  --main-color-sky: ${MAIN_COLORS.sky};
  --main-color-blue: ${MAIN_COLORS.blue};
  --main-color-purple: ${MAIN_COLORS.purple};
  --main-color-pink: ${MAIN_COLORS.pink};
  --main-color-red: ${MAIN_COLORS.red};
  --main-color-orange: ${MAIN_COLORS.orange};
  --main-color-yellow: ${MAIN_COLORS.yellow};
  --main-color-gray: ${MAIN_COLORS.gray};
`;
