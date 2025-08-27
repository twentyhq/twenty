import { css } from '@emotion/react';
import { COLOR } from './Colors';

export const TAG_LIGHT = {
  text: {
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
  background: {
    green: COLOR.green20,
    turquoise: COLOR.turquoise20,
    sky: COLOR.sky20,
    blue: COLOR.blue20,
    purple: COLOR.purple20,
    pink: COLOR.pink20,
    red: COLOR.red20,
    orange: COLOR.orange20,
    yellow: COLOR.yellow20,
    gray: COLOR.gray20,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const TAG_LIGHT_CSS = css`
  --tag-light-background-blue: ${TAG_LIGHT.background.blue};
  --tag-light-background-gray: ${TAG_LIGHT.background.gray};
  --tag-light-background-green: ${TAG_LIGHT.background.green};
  --tag-light-background-orange: ${TAG_LIGHT.background.orange};
  --tag-light-background-pink: ${TAG_LIGHT.background.pink};
  --tag-light-background-purple: ${TAG_LIGHT.background.purple};
  --tag-light-background-red: ${TAG_LIGHT.background.red};
  --tag-light-background-sky: ${TAG_LIGHT.background.sky};
  --tag-light-background-turquoise: ${TAG_LIGHT.background.turquoise};
  --tag-light-background-yellow: ${TAG_LIGHT.background.yellow};
  --tag-light-text-blue: ${TAG_LIGHT.text.blue};
  --tag-light-text-gray: ${TAG_LIGHT.text.gray};
  --tag-light-text-green: ${TAG_LIGHT.text.green};
  --tag-light-text-orange: ${TAG_LIGHT.text.orange};
  --tag-light-text-pink: ${TAG_LIGHT.text.pink};
  --tag-light-text-purple: ${TAG_LIGHT.text.purple};
  --tag-light-text-red: ${TAG_LIGHT.text.red};
  --tag-light-text-sky: ${TAG_LIGHT.text.sky};
  --tag-light-text-turquoise: ${TAG_LIGHT.text.turquoise};
  --tag-light-text-yellow: ${TAG_LIGHT.text.yellow};
`;
