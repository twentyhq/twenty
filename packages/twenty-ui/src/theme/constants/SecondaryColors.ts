/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { css } from '@emotion/react';
import { GRAY_SCALE } from './GrayScale';

export const SECONDARY_COLORS = {
  yellow80: '#2e2a1a',
  yellow70: '#453d1e',
  yellow60: '#746224',
  yellow50: '#b99b2e',
  yellow40: '#ffe074',
  yellow30: '#ffedaf',
  yellow20: '#fff6d7',
  yellow10: '#fffbeb',

  green80: '#1d2d1b',
  green70: '#23421e',
  green60: '#2a5822',
  green50: '#42ae31',
  green40: '#88f477',
  green30: '#ccfac5',
  green20: '#ddfcd8',
  green10: '#eefdec',

  turquoise80: '#172b23',
  turquoise70: '#173f2f',
  turquoise60: '#166747',
  turquoise50: '#16a26b',
  turquoise40: '#5be8b1',
  turquoise30: '#a1f2d2',
  turquoise20: '#d0f8e9',
  turquoise10: '#e8fcf4',

  sky80: '#152b2e',
  sky70: '#123f45',
  sky60: '#0e6874',
  sky50: '#07a4b9',
  sky40: '#4de9ff',
  sky30: '#99f3ff',
  sky20: '#ccf9ff',
  sky10: '#e5fcff',

  blue80: '#171e2c',
  blue70: '#172642',
  blue60: '#18356d',
  blue50: '#184bad',
  blue40: '#5e90f2',
  blue30: '#a3c0f8',
  blue20: '#d1dffb',
  blue10: '#e8effd',

  purple80: '#231e2e',
  purple70: '#2f2545',
  purple60: '#483473',
  purple50: '#6c49b8',
  purple40: '#b28ffe',
  purple30: '#d3bffe',
  purple20: '#e9dfff',
  purple10: '#f4efff',

  pink80: '#2d1c29',
  pink70: '#43213c',
  pink60: '#702c61',
  pink50: '#b23b98',
  pink40: '#f881de',
  pink30: '#fbb7ec',
  pink20: '#fddbf6',
  pink10: '#feedfa',

  red80: '#2d1b1b',
  red70: '#441f1f',
  red60: '#712727',
  red50: '#b43232',
  red40: '#fa7878',
  red30: '#fcb2b2',
  red20: '#fed8d8',
  red10: '#feecec',

  orange80: '#2e2018',
  orange70: '#452919',
  orange60: '#743b1b',
  orange50: '#b9571f',
  orange40: '#ff9c64',
  orange30: '#ffc7a7',
  orange20: '#ffe3d3',
  orange10: '#fff1e9',

  gray80: GRAY_SCALE.gray70,
  gray70: GRAY_SCALE.gray65,
  gray60: GRAY_SCALE.gray55,
  gray50: GRAY_SCALE.gray40,
  gray40: GRAY_SCALE.gray25,
  gray35: GRAY_SCALE.gray35,
  gray30: GRAY_SCALE.gray20,
  gray20: GRAY_SCALE.gray15,
  gray10: GRAY_SCALE.gray10,
  blueAccent90: '#141a25',
  blueAccent85: '#151d2e',
  blueAccent80: '#152037',
  blueAccent75: '#16233f',
  blueAccent70: '#17294a',
  blueAccent60: '#18356d',
  blueAccent40: '#a3c0f8',
  blueAccent35: '#c8d9fb',
  blueAccent25: '#dae6fc',
  blueAccent20: '#e2ecfd',
  blueAccent15: '#edf2fe',
  blueAccent10: '#f5f9fd',
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const SECONDARY_COLORS_CSS = css`
  --color-blue10: ${SECONDARY_COLORS.blue10};
  --color-blue20: ${SECONDARY_COLORS.blue20};
  --color-blue30: ${SECONDARY_COLORS.blue30};
  --color-blue40: ${SECONDARY_COLORS.blue40};
  --color-blue50: ${SECONDARY_COLORS.blue50};
  --color-blue60: ${SECONDARY_COLORS.blue60};
  --color-blue70: ${SECONDARY_COLORS.blue70};
  --color-blue80: ${SECONDARY_COLORS.blue80};

  --color-green10: ${SECONDARY_COLORS.green10};
  --color-green20: ${SECONDARY_COLORS.green20};
  --color-green30: ${SECONDARY_COLORS.green30};
  --color-green40: ${SECONDARY_COLORS.green40};
  --color-green50: ${SECONDARY_COLORS.green50};
  --color-green60: ${SECONDARY_COLORS.green60};
  --color-green70: ${SECONDARY_COLORS.green70};
  --color-green80: ${SECONDARY_COLORS.green80};

  --color-purple10: ${SECONDARY_COLORS.purple10};
  --color-purple20: ${SECONDARY_COLORS.purple20};
  --color-purple30: ${SECONDARY_COLORS.purple30};
  --color-purple40: ${SECONDARY_COLORS.purple40};
  --color-purple50: ${SECONDARY_COLORS.purple50};
  --color-purple60: ${SECONDARY_COLORS.purple60};
  --color-purple70: ${SECONDARY_COLORS.purple70};
  --color-purple80: ${SECONDARY_COLORS.purple80};

  --color-yellow10: ${SECONDARY_COLORS.yellow10};
  --color-yellow20: ${SECONDARY_COLORS.yellow20};
  --color-yellow30: ${SECONDARY_COLORS.yellow30};
  --color-yellow40: ${SECONDARY_COLORS.yellow40};
  --color-yellow50: ${SECONDARY_COLORS.yellow50};
  --color-yellow60: ${SECONDARY_COLORS.yellow60};
  --color-yellow70: ${SECONDARY_COLORS.yellow70};
  --color-yellow80: ${SECONDARY_COLORS.yellow80};

  --color-red10: ${SECONDARY_COLORS.red10};
  --color-red20: ${SECONDARY_COLORS.red20};
  --color-red30: ${SECONDARY_COLORS.red30};
  --color-red40: ${SECONDARY_COLORS.red40};
  --color-red50: ${SECONDARY_COLORS.red50};
  --color-red60: ${SECONDARY_COLORS.red60};
  --color-red70: ${SECONDARY_COLORS.red70};
  --color-red80: ${SECONDARY_COLORS.red80};

  --color-orange10: ${SECONDARY_COLORS.orange10};
  --color-orange20: ${SECONDARY_COLORS.orange20};
  --color-orange30: ${SECONDARY_COLORS.orange30};
  --color-orange40: ${SECONDARY_COLORS.orange40};
  --color-orange50: ${SECONDARY_COLORS.orange50};
  --color-orange60: ${SECONDARY_COLORS.orange60};
  --color-orange70: ${SECONDARY_COLORS.orange70};
  --color-orange80: ${SECONDARY_COLORS.orange80};

  --color-gray10: ${SECONDARY_COLORS.gray10};
  --color-gray20: ${SECONDARY_COLORS.gray20};
  --color-gray30: ${SECONDARY_COLORS.gray30};
  --color-gray35: ${SECONDARY_COLORS.gray35};
  --color-gray40: ${SECONDARY_COLORS.gray40};
  --color-gray50: ${SECONDARY_COLORS.gray50};
  --color-gray60: ${SECONDARY_COLORS.gray60};
  --color-gray70: ${SECONDARY_COLORS.gray70};
  --color-gray80: ${SECONDARY_COLORS.gray80};

  --color-blueAccent90: ${SECONDARY_COLORS.blueAccent90};
  --color-blueAccent85: ${SECONDARY_COLORS.blueAccent85};
  --color-blueAccent80: ${SECONDARY_COLORS.blueAccent80};
  --color-blueAccent75: ${SECONDARY_COLORS.blueAccent75};
  --color-blueAccent70: ${SECONDARY_COLORS.blueAccent70};
  --color-blueAccent60: ${SECONDARY_COLORS.blueAccent60};
  --color-blueAccent40: ${SECONDARY_COLORS.blueAccent40};
  --color-blueAccent35: ${SECONDARY_COLORS.blueAccent35};
  --color-blueAccent25: ${SECONDARY_COLORS.blueAccent25};
  --color-blueAccent20: ${SECONDARY_COLORS.blueAccent20};
  --color-blueAccent15: ${SECONDARY_COLORS.blueAccent15};
  --color-blueAccent10: ${SECONDARY_COLORS.blueAccent10};
`;
