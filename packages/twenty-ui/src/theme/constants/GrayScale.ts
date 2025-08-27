import { css } from '@emotion/react';

/* eslint-disable @nx/workspace-no-hardcoded-colors */
export const GRAY_SCALE = {
  gray100: '#000000',
  gray90: '#141414',
  gray85: '#171717',
  gray80: '#1b1b1b',
  gray75: '#1d1d1d',
  gray70: '#222222',
  gray65: '#292929',
  gray60: '#333333',
  gray55: '#4c4c4c',
  gray50: '#666666',
  gray45: '#818181',
  gray40: '#999999',
  gray35: '#b3b3b3',
  gray30: '#cccccc',
  gray25: '#d6d6d6',
  gray20: '#ebebeb',
  gray15: '#f1f1f1',
  gray10: '#fcfcfc',
  gray0: '#ffffff',
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const GRAY_SCALE_CSS = css`
  --gray-scale-gray0: ${GRAY_SCALE.gray0};
  --gray-scale-gray10: ${GRAY_SCALE.gray10};
  --gray-scale-gray100: ${GRAY_SCALE.gray100};
  --gray-scale-gray15: ${GRAY_SCALE.gray15};
  --gray-scale-gray20: ${GRAY_SCALE.gray20};
  --gray-scale-gray25: ${GRAY_SCALE.gray25};
  --gray-scale-gray30: ${GRAY_SCALE.gray30};
  --gray-scale-gray35: ${GRAY_SCALE.gray35};
  --gray-scale-gray40: ${GRAY_SCALE.gray40};
  --gray-scale-gray45: ${GRAY_SCALE.gray45};
  --gray-scale-gray50: ${GRAY_SCALE.gray50};
  --gray-scale-gray55: ${GRAY_SCALE.gray55};
  --gray-scale-gray60: ${GRAY_SCALE.gray60};
  --gray-scale-gray65: ${GRAY_SCALE.gray65};
  --gray-scale-gray70: ${GRAY_SCALE.gray70};
  --gray-scale-gray75: ${GRAY_SCALE.gray75};
  --gray-scale-gray80: ${GRAY_SCALE.gray80};
  --gray-scale-gray85: ${GRAY_SCALE.gray85};
  --gray-scale-gray90: ${GRAY_SCALE.gray90};
`;
