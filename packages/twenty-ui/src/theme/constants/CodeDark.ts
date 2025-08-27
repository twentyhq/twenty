import { css } from '@linaria/core';
import { COLOR } from './Colors';

export const CODE_DARK = {
  text: {
    gray: COLOR.gray50,
    sky: COLOR.sky50,
    pink: COLOR.pink50,
    orange: COLOR.orange40,
  },
};

// eslint-disable-next-line @nx/workspace-max-consts-per-file
export const CODE_DARK_CSS = css`
  --code-text-gray: ${CODE_DARK.text.gray};
  --code-text-sky: ${CODE_DARK.text.sky};
  --code-text-pink: ${CODE_DARK.text.pink};
  --code-text-orange: ${CODE_DARK.text.orange};
`;
