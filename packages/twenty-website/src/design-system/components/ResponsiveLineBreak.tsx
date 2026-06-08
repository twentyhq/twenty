import { styled } from '@linaria/react';

import { theme } from '@/theme';

// A line break that only renders at md and up. Lets copy carry an optional
// desktop-only break as a structural element a translator can position inside
// a <Trans> unit, instead of coupling the break to the copy via a hard \n plus
// `white-space: pre-line` on the container (which forces translators to manage
// the newline themselves).
export const ResponsiveLineBreak = styled.br`
  display: none;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: revert;
  }
`;
