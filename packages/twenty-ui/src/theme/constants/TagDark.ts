import { css } from '@emotion/react';
import { COLOR } from './Colors';

export const TAG_DARK = {
  text: {
    green: COLOR.green10,
    turquoise: COLOR.turquoise10,
    sky: COLOR.sky10,
    blue: COLOR.blue10,
    purple: COLOR.purple10,
    pink: COLOR.pink10,
    red: COLOR.red10,
    orange: COLOR.orange10,
    yellow: COLOR.yellow10,
    gray: COLOR.gray10,
  },
  background: {
    green: COLOR.green60,
    turquoise: COLOR.turquoise60,
    sky: COLOR.sky60,
    blue: COLOR.blue60,
    purple: COLOR.purple60,
    pink: COLOR.pink60,
    red: COLOR.red60,
    orange: COLOR.orange60,
    yellow: COLOR.yellow60,
    gray: COLOR.gray60,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const TAG_DARK_CSS = css`
  --tag-dark-background-blue: ${TAG_DARK.background.blue};
  --tag-dark-background-gray: ${TAG_DARK.background.gray};
  --tag-dark-background-green: ${TAG_DARK.background.green};
  --tag-dark-background-orange: ${TAG_DARK.background.orange};
  --tag-dark-background-pink: ${TAG_DARK.background.pink};
  --tag-dark-background-purple: ${TAG_DARK.background.purple};
  --tag-dark-background-red: ${TAG_DARK.background.red};
  --tag-dark-background-sky: ${TAG_DARK.background.sky};
  --tag-dark-background-turquoise: ${TAG_DARK.background.turquoise};
  --tag-dark-background-yellow: ${TAG_DARK.background.yellow};
  --tag-dark-text-blue: ${TAG_DARK.text.blue};
  --tag-dark-text-gray: ${TAG_DARK.text.gray};
  --tag-dark-text-green: ${TAG_DARK.text.green};
  --tag-dark-text-orange: ${TAG_DARK.text.orange};
  --tag-dark-text-pink: ${TAG_DARK.text.pink};
  --tag-dark-text-purple: ${TAG_DARK.text.purple};
  --tag-dark-text-red: ${TAG_DARK.text.red};
  --tag-dark-text-sky: ${TAG_DARK.text.sky};
  --tag-dark-text-turquoise: ${TAG_DARK.text.turquoise};
  --tag-dark-text-yellow: ${TAG_DARK.text.yellow};
`;
