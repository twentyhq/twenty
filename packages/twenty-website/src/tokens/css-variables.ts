import { css } from '@linaria/core';

import { buildCssVariableDeclarations } from './build-css-variable-declarations';

// Evaluated by Linaria at build time: the :root block is generated from the
// token definitions, never written by hand.
export const tokenCssVariables = css`
  :global(:root) {
    ${buildCssVariableDeclarations()}
  }
`;
