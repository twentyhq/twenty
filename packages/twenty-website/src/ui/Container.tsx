import { styled } from '@linaria/react';

import { GUTTER, MAX_CONTENT_WIDTH_PX, mediaUp, spacing } from '@/tokens';

// The only horizontal gutter on the site: sections never set their own.
// SectionShell is the standard consumer; page chrome (menu, footer)
// composes it directly.
export const Container = styled.div`
  margin-inline: auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  padding-inline: ${spacing(GUTTER.base)};
  width: 100%;

  ${mediaUp('md')} {
    padding-inline: ${spacing(GUTTER.md)};
  }

  &[data-flush-inline] {
    padding-inline: 0;
  }
`;
