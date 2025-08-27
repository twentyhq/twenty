import { css } from '@emotion/react';
import { COLOR } from './Colors';

export const CODE_LIGHT = {
  text: {
    gray: COLOR.gray50,
    sky: COLOR.sky50,
    pink: COLOR.pink50,
    orange: COLOR.orange40,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const CODE_LIGHT_CSS = css`
  --code-text-gray: ${CODE_LIGHT.text.gray};
  --code-text-sky: ${CODE_LIGHT.text.sky};
  --code-text-pink: ${CODE_LIGHT.text.pink};
  --code-text-orange: ${CODE_LIGHT.text.orange};
`;
