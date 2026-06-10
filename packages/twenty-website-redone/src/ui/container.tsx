import { styled } from '@linaria/react';

import { GUTTER, MAX_CONTENT_WIDTH_PX, mediaUp, spacing } from '@/tokens';

// Owns the page's horizontal frame: max content width plus the only
// horizontal gutter on the site. Sections never set their own.
export const Container = styled.div`
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  padding-inline: ${spacing(GUTTER.base)};
  width: 100%;

  ${mediaUp('md')} {
    padding-inline: ${spacing(GUTTER.md)};
  }
`;
