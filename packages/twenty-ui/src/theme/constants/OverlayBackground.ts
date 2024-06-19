import { css } from '@emotion/react';

import { ThemeType } from '..';

export const OVERLAY_BACKGROUND = (props: { theme: ThemeType }) => css`
  backdrop-filter: ${props.theme.blur.medium};
  background: ${props.theme.background.transparent.secondary};
  box-shadow: ${props.theme.boxShadow.strong};
`;
